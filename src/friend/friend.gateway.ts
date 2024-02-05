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

@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: "/friend" })
@Injectable()
export class FriendGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private readonly redisService: RedisService) {}

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
}
