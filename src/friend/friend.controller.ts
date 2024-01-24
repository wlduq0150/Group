import {
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

@Controller("friend")
export class FriendController {
    constructor(private readonly friendService: FriendService) {}

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

        const send = await this.friendService.initiateFriendRequest(
            discordId,
            friendId,
        );

        return {
            statusCode: HttpStatus.CREATED,
            message: "친구 신청이 성공적으로 전송되었습니다.",
            data: send,
        };
    }

    // 친구 요청 수락
    @Post("/:requestId/accept")
    async acceptFriendRequest(
        @Req() req,
        @Param("requestId") requestId: number,
        @Session() session,
    ) {
        const discordId = session.discordUserId;

        const accept = await this.friendService.acceptFriendRequest(
            requestId,
            discordId,
        );
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
        return {
            statusCode: HttpStatus.OK,
            message: "친구를 삭제했습니다.",
            data: deleteUser,
        };
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
        return {
            statusCode: HttpStatus.CREATED,
            message: "사용자를 차단했습니다.",
            data: block,
        };
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
        return {
            statusCode: HttpStatus.OK,
            message: "사용자 차단을 해제했습니다.",
            data: unblock,
        };
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
}
