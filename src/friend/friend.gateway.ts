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
        console.log(`[Group]client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        console.log(`[Group]client disconnected: ${client.id}`);
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
        const date = new Date();

        const accepterClientId = await this.redisService.get(
            `friend:${sendMessageDto.friendId}`,
        );

        const messageRoom = await this.friendService.checkMessageRoom(
            client["userId"],
            +sendMessageDto.friendId,
        );

        if (accepterClientId) {
            this.server.to(accepterClientId).emit("sendMessage", {
                senderId: client["userId"],
                message: sendMessageDto.message,
                sendDate: date,
            });
        }

        client.emit("sendMessage", {
            senderId: client["userId"],
            message: sendMessageDto.message,
            sendDate: date,
        });

        await this.redisService.set(
            `friendMessage:${client["userId"]}:${
                sendMessageDto.friendId
            }:${date.toString()}`,
            JSON.stringify({
                senderId: client["userId"],
                accepterId: sendMessageDto.friendId,
                message: sendMessageDto.message,
                date: date.toString(),
                messageRoomId: messageRoom.id,
            }),
        );

        this.saveOneMessage(
            client["userId"],
            +sendMessageDto.friendId,
            sendMessageDto.message,
            date,
            +messageRoom.id,
        );

        /*
        //배열형태인 redis 키값
        const messageCount = await this.getRedisKey(
            client["userId"],
            +sendMessageDto.friendId,
        );

        if (messageCount[1].length > 100) {
            this.saveSendedMessage(messageCount[1]).then(() => {
                for (let ms of messageCount[1]) {
                    this.redisService.del(ms);
                }
            });
        }*/
    }

    async saveMessages(myId: number, friendId: number) {
        const messageCount = await this.getRedisKey(myId, friendId);
        this.saveSendedMessage(messageCount[1]).then((e) => {
            for (let ms of messageCount[1]) {
                this.redisService.del(ms);
            }
        });
    }

    //redis에서 유저id 두개로 키값 찾기
    private async getRedisKey(myId: number, friendId: number) {
        return await this.redisService.scan(
            `friendMessage:${myId}:${friendId}`,
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

    //배열형태로 메세지 저장
    private async saveSendedMessage(messageCount: string[]) {
        let sendMessages = [];
        for (let message of messageCount) {
            const oneMessage: any = await this.redisService.get(`${message}`);
            const parseMessage = JSON.parse(oneMessage);
            sendMessages.push({
                senderId: +parseMessage.senderId,
                accepterId: +parseMessage.accepterId,
                message: parseMessage.message,
                sendDate: parseMessage.date,
                messageRoomId: parseMessage.messageRoomId,
            });
        }

        this.friendService.saveSendMessage(sendMessages);
    }
}
