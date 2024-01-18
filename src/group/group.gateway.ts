import { Injectable, UseFilters } from "@nestjs/common";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GroupService } from "src/group/group.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { JoinGroupDto } from "./dto/join-group.dto";
import { SelectPositionDto } from "./dto/select-position.dto";
import { checkIsUserAlreadyJoin } from "./function/check-user-already-join.function";
import { checkIsUserAlreadyGroupJoin } from "./function/check-user-group-join.function";
import { WsException } from "./exception/ws-exception.exception";
import { WsExceptionFilter } from "./filter/ws-exception.filter";
import { v4 as uuidv4 } from "uuid";

@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: "/group", cors: "true" })
@Injectable()
export class GroupGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    // private connections: Map<string, number> = new Map();

    constructor(private readonly groupService: GroupService) {}

    handleConnection(client: Socket) {
        console.log(`[Group]client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        // 클라이언트 socket 연결 해제시 connections에 등록 해제
        client["userId"] = null;

        console.log(`[Group]client disconnected: ${client.id}`);
    }

    @SubscribeMessage("clear")
    clear(client: Socket): void {
        this.groupService.clear();

        this.server.emit("clear", { message: "Redis 초기화 완료" });
    }

    @SubscribeMessage("getAll")
    async getAll(client: Socket): Promise<void> {
        const data = await this.groupService.findAllGroup();

        this.server.emit("getAll", { keys: data });
    }

    // 클라이언트 socket 연결시 connections에 등록
    @SubscribeMessage("connectWithUserId")
    connectWithUserId(client: Socket, userId: number): void {
        client["userId"] = +userId;
    }

    // 클라이언트에서 그룹 생성시 발생하는 이벤트
    @SubscribeMessage("groupCreate")
    async groupCreate(
        client: Socket,
        createGroupDto: CreateGroupDto,
    ): Promise<void> {
        const userId = client["userId"];
        if (!userId) {
            throw new WsException("로그인이 필요합니다.");
        }

        if (checkIsUserAlreadyJoin(client)) {
            throw new WsException("이미 그룹에 참여중입니다.");
        }

        const uniqueId = uuidv4();
        const groupId = `group-${uniqueId}#`; // 유니큰한 값 랜덤 생성으로 바뀔 예정
        const groupInfo = await this.groupService.createGroup(
            groupId,
            createGroupDto,
        );

        client.join(groupId);

        const groupState = await this.groupService.joinGroup(groupId);

        this.server.to(groupId).emit("groupJoin", { groupId, userId });
        this.server
            .to(client.id)
            .emit("positionSelect", { groupId, groupInfo, groupState });
    }

    // 클라이언트에서 그룹 참여시 발생하는 이벤트
    @SubscribeMessage("groupJoin")
    async groupJoin(client: Socket, joinGroupDto: JoinGroupDto): Promise<void> {
        const { groupId } = joinGroupDto;
        const userId = client["userId"];
        if (!userId) {
            throw new WsException("로그인이 필요합니다.");
        }

        // 이미 그룹에 참여중인 경우 예외처리
        const result = checkIsUserAlreadyJoin(client);
        if (result) {
            throw new WsException("이미 그룹에 참여중입니다.");
        }

        const groupInfo = await this.groupService.findGroupInfoById(groupId);
        const groupState = await this.groupService.joinGroup(groupId);

        // 그룹 참가
        client.join(groupId);

        this.server.to(groupId).emit("groupJoin", { groupId, userId });
        this.server
            .to(client.id)
            .emit("positionSelect", { groupId, groupInfo, groupState });
    }

    // 클라이언트에서 포지션 선택시 발생하는 이벤트
    @SubscribeMessage("positionSelect")
    async positionSelect(
        client: Socket,
        selectPositionDto: SelectPositionDto,
    ): Promise<void> {
        const { groupId, position } = selectPositionDto;
        const userId = client["userId"];
        if (!userId) {
            throw new WsException("로그인이 필요합니다.");
        }

        if (!checkIsUserAlreadyGroupJoin(client, groupId)) {
            throw new WsException("해당 그룹에 참여하고 있지 않습니다.");
        }

        const groupState = await this.groupService.selectPosition(
            groupId,
            userId,
            position,
        );

        this.server
            .to(groupId)
            .emit("positionSelected", { groupState, position, userId });
    }

    // 클라이언트에서 포지션 선택해제시 발생하는 이벤트
    @SubscribeMessage("positionDeselect")
    async positionDeselect(
        client: Socket,
        selectPositionDto: SelectPositionDto,
    ): Promise<void> {
        const { groupId, position } = selectPositionDto;
        const userId = client["userId"];
        if (!userId) {
            throw new WsException("로그인이 필요합니다.");
        }

        if (!checkIsUserAlreadyGroupJoin(client, groupId)) {
            throw new WsException("해당 그룹에 참여하고 있지 않습니다.");
        }

        const groupState = await this.groupService.deselectPosition(
            groupId,
            +userId,
            position,
        );

        this.server.to(groupId).emit("positionDeselected", { groupState });
    }

    @SubscribeMessage("groupLeave")
    async groupLeave(
        client: Socket,
        joinGroupDto: JoinGroupDto,
    ): Promise<void> {
        const { groupId } = joinGroupDto;
        const userId = client["userId"];
        if (!userId) {
            throw new WsException("로그인이 필요합니다.");
        }

        const result = await this.groupService.leaveGroup(groupId, userId);

        if (!checkIsUserAlreadyGroupJoin(client, groupId)) {
            throw new WsException("해당 그룹에 참여하고 있지 않습니다.");
        }

        // 그룹 나가기
        client.leave(groupId);

        // 그룹에 아무도 없어 그룹을 없애야 하는 경우
        if (!result) {
            this.server.to(client.id).emit("groupLeave");
        } else {
            // 그룹에 남은 유저가 있는 경우
            this.server
                .to(groupId)
                .emit("positionDeselected", { groupState: result });
            this.server.to(groupId).emit("otherGroupLeave", { userId });
            this.server.to(client.id).emit("groupLeave");
        }
    }
}
