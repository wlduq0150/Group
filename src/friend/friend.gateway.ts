import { Injectable, UseFilters } from "@nestjs/common";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsExceptionFilter } from "src/group/filter/ws-exception.filter";
import { FriendRequestDto } from "./dto/friend-request.dto";
import { RedisService } from "src/redis/redis.service";
import { SendMessageDto } from "./dto/friend-message.dto";
import { SendMessageType } from "./interface/sendMessage.interface";
import { FriendService } from "./friend.service";
import { DeleteFriendDto } from "./dto/friend-delete.dto";
import { BlockedUserDto } from "./dto/friend-blocked.dto";

@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: "/friend" })
@Injectable()
export class FriendGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        private readonly redisService: RedisService,
        private readonly friendService: FriendService,
    ) {}

    handleConnection(client: Socket) {
        console.log(`[Friend]client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        console.log(`[Friend]client disconnected: ${client.id}`);
        if (client["userId"]) {
            await this.redisService.del(`friend:${client["userId"]}`);
        }
    }

    // 클라이언트 socket 연결시 connections에 등록
    @SubscribeMessage("connectWithUserId")
    async connectWithUserId(client: Socket, userId: number) {
        client["userId"] = +userId;
        await this.redisService.set(`friend:${userId}`, client.id);
    }

    async sendFriendRequest(friendRequestDto: FriendRequestDto) {
        const accepterClientId = await this.redisService.get(
            `friend:${friendRequestDto.accepterId}`,
        );

        this.server
            .to(accepterClientId)
            .emit("friendRequest", { user: friendRequestDto.sender });
    }

    async sendFriendComplete(
        client: Socket,
        senderId: number,
        accepterId: number,
    ) {
        const senderClientId = await this.redisService.get(
            `friend:${senderId}`,
        );
        const accepterClientId = await this.redisService.get(
            `friend:${accepterId}`,
        );

        this.server
            .to(accepterClientId)
            .emit("friendComplete", { friendId: senderId });
        this.server
            .to(senderClientId)
            .emit("friendComplete", { friendId: accepterId });

        client.emit("friendComplete", {
            friendId: accepterId,
        });
    }

    //친구에게 메세지 보내기
    @SubscribeMessage("sendMessage")
    async sendMessageFriend(client: Socket, sendMessageDto: SendMessageDto) {
        const offset = 1000 * 60 * 60 * 9;
        const korNow = new Date(new Date().getTime() + offset);
        const accepterClientId = await this.redisService.get(
            `friend:${sendMessageDto.friendId}`,
        );

        const messageRoom = await this.friendService.getMessageRoomId(
            client["userId"],
            +sendMessageDto.friendId,
        );

        //친구에게 새 메세지 보내기
        if (accepterClientId) {
            this.server.to(accepterClientId).emit("sendMessage", {
                senderId: client["userId"],
                message: sendMessageDto.message,
                sendDate: korNow,
                messageRoomId: messageRoom.id,
            });
        }

        //자신에게 새 메세지 보내기
        client.emit("sendMessage", {
            senderId: client["userId"],
            message: sendMessageDto.message,
            sendDate: korNow,
            messageRoomId: messageRoom.id,
        });
        const messageData = {
            senderId: client["userId"],
            accepterId: +sendMessageDto.friendId,
            message: sendMessageDto.message,
            sendDate: korNow,
            messageRoomId: messageRoom.id,
        };

        //레디스에 새 메세지 저장
        await this.friendService.saveNewMessageRedis(
            messageRoom.id,
            messageData,
        );

        //db에 비동기적으로 새 메세지 저장
        this.saveOneMessage(
            client["userId"],
            +sendMessageDto.friendId,
            sendMessageDto.message,
            korNow,
            +messageRoom.id,
        );
    }

    //메세지 저장
    private saveOneMessage(
        senderId: number,
        accepterId: number,
        message: string,
        sendDate: Date,
        messageRoomId: number,
    ) {
        let oneMessage = {
            senderId,
            accepterId,
            message,
            sendDate,
            messageRoomId,
        };
        this.friendService.saveOneMessage(oneMessage);
    }

    //친구 삭제시 친구였던사람에게 알림
    @SubscribeMessage("deleteFriend")
    async deleteFriend(client: Socket, deleteFriendDto: DeleteFriendDto) {
        const friendClientId = await this.redisService.get(
            `friend:${deleteFriendDto.friendId}`,
        );
        if (friendClientId) {
            this.server.to(friendClientId).emit("deleteFriend", {
                id: client["userId"],
            });
        }

        client.emit("deleteFriend", {
            id: deleteFriendDto.friendId,
        });
    }

    //친구 차단시
    @SubscribeMessage("blockedUser")
    async blockUser(client: Socket, blockedUserDto: BlockedUserDto) {
        const blockedClientId = await this.redisService.get(
            `friend:${blockedUserDto}`,
        );
        if (blockedClientId) {
            this.server
                .to(blockedClientId)
                .emit("blockedUser", { deleteId: client["userId"] });
        }

        client.emit("blockedUser");
    }
}
