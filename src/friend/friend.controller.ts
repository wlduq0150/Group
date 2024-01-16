import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { FriendService } from "./friend.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { accessTokenGuard } from "src/auth/guard/access-token.guard";
import { FriendRequestDto } from "./dto/friend.dto";

@ApiBearerAuth("accessToken")
@UseGuards(accessTokenGuard)
@Controller("friend")
export class FriendController {
    constructor(private readonly friendService: FriendService) {}

    @Post("/:friendId/request")
    async sendFriendRequest(@Req() req, @Param("friendId") friendId: number) {
        const { id: senderId } = req.user;

        const send = await this.friendService.sendFriendRequest(
            senderId,
            friendId,
        );

        return {
            statusCode: HttpStatus.CREATED,
            message: "친구 신청이 성공적으로 전송되었습니다.",
            data: send,
        };
    }

    @Patch("/:friendId/accept")
    async acceptFriendRequest(
        @Req() req,
        @Param("friendId") requestId: number,
    ) {
        const { id: userId } = req.user;
        const accept = await this.friendService.acceptFriendRequest(
            userId,
            requestId,
        );
        return {
            statusCode: HttpStatus.OK,
            message: "친구 요청을 수락했습니다.",
            data: accept,
        };
    }

    @Patch("/:friendId/decline")
    async declineFriendRequest(
        @Req() req,
        @Param("friendId") requestId: number,
    ) {
        const { id: userId } = req.user;
        const decline = await this.friendService.declineFriendRequest(
            userId,
            requestId,
        );
        return {
            statusCode: HttpStatus.OK,
            message: "친구 요청을 거절했습니다.",
            data: decline,
        };
    }

    @Delete("/:friendId")
    async deleteFriend(@Req() req, @Param("friendId") friendId: number) {
        const { id: userId } = req.user;
        const deleteUser = await this.friendService.deleteFriend(
            userId,
            friendId,
        );
        return {
            statusCode: HttpStatus.OK,
            message: "친구를 삭제했습니다.",
            data: deleteUser,
        };
    }

    @Post("/:friendId/block")
    async blockUser(@Req() req, @Param("friendId") userIdToBlock: number) {
        const { id: userId } = req.user;
        const block = await this.friendService.blockUser(userId, userIdToBlock);
        return {
            statusCode: HttpStatus.CREATED,
            message: "사용자를 차단했습니다.",
            data: block,
        };
    }

    @Post("/:friendId/report")
    async reportUser(@Req() req, @Param("friendId") reportedUserId: number) {
        const { id: userId } = req.user;
        const report = await this.friendService.reportUser(
            userId,
            reportedUserId,
        );
        return {
            statusCode: HttpStatus.CREATED,
            message: "사용자를 신고했습니다.",
            data: report,
        };
    }

    @Get("/:userId/friends")
    async getFriendList(@Param("userId") userId: number) {
        const friends = await this.friendService.getFriendList(userId);
        return {
            statusCode: HttpStatus.OK,
            message: "친구를 조회했습니다.",
            data: friends,
        };
    }

    @Get("/:userId/blocked-users")
    async getBlockedUsers(@Param("userId") userId: number) {
        const blockedUsers = await this.friendService.getBlockedUsers(userId);
        return {
            statusCode: HttpStatus.OK,
            message: "차단 목록을 조회했습니다.",
            data: blockedUsers,
        };
    }
}
