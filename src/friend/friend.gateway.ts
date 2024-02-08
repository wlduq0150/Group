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
import { SendMessageDto } from "./dto/firend-message.dto";
import { SendMessageType } from "./interface/sendMessage.interface";
import { FriendService } from "./friend.service";

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

    async sendFriendComplete(senderId: number, accepterId: number) {
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
    }

    //친구에게 메세지 보내기
    @SubscribeMessage("sendMessage")
    async sendMessageFriend(client: Socket, sendMessageDto: SendMessageDto) {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
        const koreaTimeDiff = 9 * 60 * 60 * 1000;
        const korNow = new Date(utc + koreaTimeDiff);

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
            });
        }

        //자신에게 새 메세지 보내기
        client.emit("sendMessage", {
            senderId: client["userId"],
            message: sendMessageDto.message,
            sendDate: korNow,
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
}
