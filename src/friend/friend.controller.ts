import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Post,
    Req,
    Session,
} from "@nestjs/common";
import { FriendService } from "./friend.service";
import { FriendGateway } from "./friend.gateway";
import { MessageRoomDto } from "./dto/friend-send-accept.dto";
import { SendMessageDto } from "./dto/friend-message.dto";
import { RoomMessageDto } from "./dto/friend-message-room.dto";
import { Socket } from "socket.io";

@Controller("friend")
export class FriendController {
    constructor(
        private readonly friendService: FriendService,
        private readonly friendGateway: FriendGateway,
    ) {}

    // 키 확인 테스트
    @Get("test/:key")
    async test(@Param("key") key: string) {
        return await this.friendService.test(key);
    }

    // 친구 요청
    @Post("/:friendId/request")
    async initiateFriendRequest(
        @Req() req,
        @Param("friendId") friendId: number,
        @Session() session,
    ) {
        const discordId = session.discordUserId;

        const { sender, requester } =
            await this.friendService.initiateFriendRequest(discordId, friendId);

        this.friendGateway.sendFriendRequest({
            sender,
            accepterId: requester.id,
        });

        return true;
    }

    // 친구 요청 수락
    @Post("/:requestId/accept")
    async acceptFriendRequest(
        @Req() req,
        @Param("requestId") requestId: number,
        @Session() session,
    ) {
        const discordId = session.discordUserId;

        const accepterId = await this.friendService.acceptFriendRequest(
            requestId,
            discordId,
        );

        const socket: Socket = req.socket;

        this.friendGateway.sendFriendComplete(socket, requestId, accepterId);

        return true;
    }

    // 친구 요청 거절
    @Delete("/:requestId/decline")
    async declineFriendRequest(
        @Req() req,
        @Param("requestId") requestId: number,
        @Session() session,
    ) {
        const discordId = session.discordUserId;

        const decline = await this.friendService.declineFriendRequest(
            requestId,
            discordId,
        );
        return true;
    }

    // 친구 삭제
    @Delete("/:requestId/delete")
    async deleteFriend(
        @Req() req,
        @Param("requestId") requestId: number,
        @Session() session,
    ) {
        const discordId = session.discordUserId;

        const deleteUser = await this.friendService.deleteFriend(
            requestId,
            discordId,
        );
        return true;
    }

    // 유저 차단
    @Post("/:requestId/block")
    async blockUser(
        @Req() req,
        @Param("requestId") requestId: number,
        @Session() session,
    ) {
        const discordId = session.discordUserId;

        const block = await this.friendService.blockUser(requestId, discordId);
        return true;
    }

    // 유저 차단 해제
    @Delete("/:requestId/unblock")
    async unblockUser(
        @Req() req,
        @Param("requestId") requestId: number,
        @Session() session,
    ) {
        const discordId = session.discordUserId;

        const unblock = await this.friendService.unblockUser(
            requestId,
            discordId,
        );
        return true;
    }

    // 친구 목록 조회
    @Get("/friends")
    async getFriendList(@Session() session) {
        const discordId = session.discordUserId;

        const friends = await this.friendService.getFriendList(discordId);

        return {
            statusCode: HttpStatus.OK,
            message: "친구를 조회했습니다.",
            data: friends,
        };
    }

    // 친구 신청 목록 조회
    @Get("/friend-requests")
    async getFriendRequestList(@Session() session) {
        const discordId = session.discordUserId;

        const friendRequests =
            await this.friendService.getFriendRequestList(discordId);

        return {
            statusCode: HttpStatus.OK,
            message: "친구를 조회했습니다.",
            data: friendRequests,
        };
    }

    // 차단 목록 조회
    @Get("/blocked-users")
    async getBlockedUsers(@Session() session) {
        const discordId = session.discordUserId;

        const blockedUsers =
            await this.friendService.getBlockedUsers(discordId);

        return {
            statusCode: HttpStatus.OK,
            message: "차단 목록을 조회했습니다.",
            data: blockedUsers,
        };
    }

    //데이터베이스의 채팅내역 redis에 저장
    @Post("/setMessageRedis")
    async setMessageRedis(@Body() messageRoomDto: MessageRoomDto) {
        return await this.friendService.setMessageRedis(
            messageRoomDto.userOne,
            messageRoomDto.userTwo,
        );
    }

    //메세지방 id로 레디스의 값 조회
    @Get("/getRedisRoom/:roomId")
    async getRedisRoom(@Param("roomId") roomId: number) {
        return await this.friendService.getlrange(roomId);
    }
}
