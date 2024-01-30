import { Inject, Injectable, UseFilters, forwardRef } from "@nestjs/common";
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
import { UpdateGroupDto } from "./dto/update-group.dto";
import { GroupChatDto } from "./dto/chat-group.dto";
import { KickDto } from "./dto/kick-group.dto";
import { checkPositionCorrectForMode } from "./function/check-mode-position-correct.function";

@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: "/group", cors: "true" })
@Injectable()
export class GroupGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        @Inject(forwardRef(() => GroupService))
        private readonly groupService: GroupService,
    ) {}

    handleConnection(client: Socket) {
        console.log(`[Group]client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        //그룹 자동 나가기 및 유저 id 해제
        try {
            if (client["groupId"] !== null) {
                await this.groupLeave(client, true);
            }
        } catch (e) {
            console.log("예상치 못한 에러 발생");
        }

        Promise.all([
            this.groupService.delDataInSocket(client.id, "userId"),
            this.groupService.delDataInSocket(client.id, "groupId"),
        ]);
        console.log(`[Group]client disconnected: ${client.id}`);
    }

    // 클라이언트 socket 연결시 connections에 등록
    @SubscribeMessage("connectWithUserId")
    async connectWithUserId(client: Socket, userId: number): Promise<void> {
        await this.groupService.saveDataInSocket(client.id, "userId", userId);
    }

    @SubscribeMessage("clear")
    clear(client: Socket): void {
        this.groupService.clear();

        this.server.emit("clear", { message: "Redis 초기화 완료" });
    }

    @SubscribeMessage("openGroupUpdate")
    async openGroupUpdate(
        client: Socket,
        updateGroupDto: UpdateGroupDto,
    ): Promise<void> {
        const { groupId } = updateGroupDto;

        const [groupInfo, groupState, users] = await Promise.all([
            this.groupService.findGroupInfoById(groupId),
            this.groupService.findGroupStateById(groupId),
            this.findGroupUsers(groupId),
        ]);

        this.server
            .to(client.id)
            .emit("openGroupUpdate", { groupInfo, groupState, users });
    }

    @SubscribeMessage("getAllGroup")
    async getAll(client: Socket): Promise<void> {
        const data = await this.groupService.findAllGroup();

        this.server.to(client.id).emit("getAllGroup", { groups: data });
    }

    async findGroupUsers(groupId: string) {
        const clientSockets = await this.server.in(groupId).fetchSockets();
        const users: number[] = [];
        for (let client of clientSockets) {
            const userId = +(await this.groupService.getDataInSocket(
                client.id,
                "userId",
            ));
            users.push(userId);
        }

        return users;
    }

    // 클라이언트에서 그룹 생성시 발생하는 이벤트
    @SubscribeMessage("groupCreate")
    async groupCreate(
        client: Socket,
        createGroupDto: CreateGroupDto,
    ): Promise<void> {
        console.log(createGroupDto);
        const userId = +(await this.groupService.getDataInSocket(
            client.id,
            "userId",
        ));

        if (!userId) {
            throw new WsException("로그인이 필요합니다.");
        }

        if (checkIsUserAlreadyJoin(client)) {
            throw new WsException("이미 그룹에 참여중입니다.");
        }

        const uniqueId = uuidv4();
        const groupId = `group-${uniqueId}`; // 유니큰한 값 랜덤 생성으로 바뀔 예정
        const groupInfo = await this.groupService.createGroup(
            groupId,
            createGroupDto,
        );

        this.groupJoin(client, { groupId });
    }

    @SubscribeMessage("groupUpdate")
    async groupUpdate(
        client: Socket,
        updateGroupDto: UpdateGroupDto,
    ): Promise<void> {
        const { mode, updatePosition, groupId } = updateGroupDto;
        const userId = +(await this.groupService.getDataInSocket(
            client.id,
            "userId",
        ));
        if (!userId) {
            throw new WsException("로그인이 필요합니다.");
        }

        if (!checkIsUserAlreadyGroupJoin(client, groupId)) {
            throw new WsException("해당 그룹에 참여하고 있지 않습니다.");
        }

        // 모드별 포지션 확인
        if (mode && updatePosition) {
            checkPositionCorrectForMode(mode, updatePosition);
        }

        const { groupInfo, groupState } = await this.groupService.updateGroup(
            userId,
            groupId,
            updateGroupDto,
        );

        // 소켓으로 접속한 유저들 목록 불러오기
        const users = await this.findGroupUsers(groupId);

        this.server.to(groupId).emit("groupUpdate", {
            groupId,
            groupInfo,
            groupState,
            users: groupInfo.mode === "aram" ? users : null,
        });
    }

    // 클라이언트에서 그룹 참여시 발생하는 이벤트
    @SubscribeMessage("groupJoin")
    async groupJoin(client: Socket, joinGroupDto: JoinGroupDto): Promise<void> {
        const { groupId } = joinGroupDto;
        const userId = +(await this.groupService.getDataInSocket(
            client.id,
            "userId",
        ));
        if (!userId) {
            throw new WsException("로그인이 필요합니다.");
        }

        // 이미 그룹에 참여중인 경우 예외처리
        const result = checkIsUserAlreadyJoin(client);
        if (result) {
            throw new WsException("이미 그룹에 참여중입니다.");
        }

        const groupState = await this.groupService.joinGroup(groupId);
        const groupInfo = await this.groupService.findGroupInfoById(groupId);

        // 그룹 참가
        await client.join(groupId);
        await this.groupService.saveDataInSocket(client.id, "groupId", groupId);

        // 소켓으로 접속한 유저들 목록 불러오기
        const users = await this.findGroupUsers(groupId);

        this.server.to(groupId).emit("groupJoin", {
            groupId,
            userId,
            groupInfo,
            groupState,
            users: groupInfo.mode === "aram" ? users : null,
        });

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
        const { position } = selectPositionDto;
        const groupId = await this.groupService.getDataInSocket(
            client.id,
            "groupId",
        );
        const userId = +(await this.groupService.getDataInSocket(
            client.id,
            "userId",
        ));
        if (!userId) {
            throw new WsException("로그인이 필요합니다.");
        }

        if (!checkIsUserAlreadyGroupJoin(client, groupId)) {
            throw new WsException("해당 그룹에 참여하고 있지 않습니다.");
        }

        console.log(`${userId}님이 포지션 선택`);

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
        const { position } = selectPositionDto;
        const groupId = await this.groupService.getDataInSocket(
            client.id,
            "groupId",
        );
        const userId = +(await this.groupService.getDataInSocket(
            client.id,
            "userId",
        ));
        if (!userId) {
            throw new WsException("로그인이 필요합니다.");
        }

        if (!checkIsUserAlreadyGroupJoin(client, groupId)) {
            throw new WsException("해당 그룹에 참여하고 있지 않습니다.");
        }

        console.log(`${userId}님이 포지션 선택해제`);

        const groupState = await this.groupService.deselectPosition(
            groupId,
            +userId,
            position,
        );

        this.server.to(groupId).emit("positionDeselected", { groupState });
    }

    @SubscribeMessage("groupLeave")
    async groupLeave(client: Socket, force?: boolean): Promise<void> {
        const groupId = await this.groupService.getDataInSocket(
            client.id,
            "groupId",
        );
        const userId = +(await this.groupService.getDataInSocket(
            client.id,
            "userId",
        ));

        if (!userId) {
            throw new WsException("로그인이 필요합니다.");
        }

        if (!force && !checkIsUserAlreadyGroupJoin(client, groupId)) {
            throw new WsException("해당 그룹에 참여하고 있지 않습니다.");
        }

        // 그룹 나가기
        client.leave(groupId);
        await this.groupService.delDataInSocket(client.id, "groupId");

        // 칼바람 나락시 방장 교체를 위한 유저 목록
        const users = await this.findGroupUsers(groupId);
        const groupState = await this.groupService.leaveGroup(
            groupId,
            userId,
            users,
        );

        // 그룹에 아무도 없어 그룹을 없애야 하는 경우
        if (!groupState) {
            this.server.to(client.id).emit("groupLeave");
        } else {
            // 그룹에 남은 유저가 있는 경우
            const users = await this.findGroupUsers(groupId);
            const groupInfo =
                await this.groupService.findGroupInfoById(groupId);

            if (groupInfo.mode !== "aram") {
                this.server
                    .to(groupId)
                    .emit("positionDeselected", { groupState });
            }

            this.server.to(groupId).emit("otherGroupLeave", {
                userId,
                groupInfo,
                groupState,
                users: groupInfo.mode === "aram" ? users : [],
            });
            this.server.to(client.id).emit("groupLeave");
        }
    }

    @SubscribeMessage("kick")
    async kickUser(client: Socket, kickDto: KickDto): Promise<void> {
        const { kickedUserId } = kickDto;

        const groupId = await this.groupService.getDataInSocket(
            client.id,
            "groupId",
        );
        const userId = +(await this.groupService.getDataInSocket(
            client.id,
            "userId",
        ));

        if (userId === kickedUserId) {
            throw new WsException("본인은 강제퇴장이 불가능합니다.");
        }

        if (!userId) {
            throw new WsException("로그인이 필요합니다.");
        }

        if (!checkIsUserAlreadyGroupJoin(client, groupId)) {
            throw new WsException("해당 그룹에 참여하고 있지 않습니다.");
        }

        const groupInfo = await this.groupService.findGroupInfoById(groupId);

        if (userId !== groupInfo.owner) {
            throw new WsException("그룹장만이 강제퇴장을 할수 있습니다.");
        }

        this.server.to(groupId).emit("groupKicked", { kickedUserId });
    }

    @SubscribeMessage("chat")
    async groupChat(client: Socket, groupChatDto: GroupChatDto) {
        const { message } = groupChatDto;

        if (!checkIsUserAlreadyJoin(client)) {
            throw new WsException("그룹에 참여하고 있지 않습니다.");
        }

        const groupId = await this.groupService.getDataInSocket(
            client.id,
            "groupId",
        );
        const userId = +(await this.groupService.getDataInSocket(
            client.id,
            "userId",
        ));

        const chat = await this.groupService.createGroupChat(userId, message);

        console.log(`${userId}: ${chat}`);

        this.server.to(groupId).emit("chat", { chat });
    }
}
