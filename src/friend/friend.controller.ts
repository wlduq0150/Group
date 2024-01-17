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

@Controller("friend")
export class FriendController {
    constructor(private readonly friendService: FriendService) {}

    @Get("test/:key")
    async test(@Param("key") key: string) {
        return await this.friendService.test(key);
    }

    @Post("/:friendId/request/:myId")
    async sendFriendRequest(
        @Req() req,
        @Param("friendId") friendId: number,
        @Param("myId") senderId: number,
    ) {
        // 추후에 세션으로 바꿀 예정 테스트 중

        // const { id: senderId } = req.user;

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

    @Post("/:requestId/accept/:accepterId")
    async acceptFriendRequest(
        @Req() req,
        @Param("requestId") requestId: number,
        @Param("accepterId") accepterId: number,
    ) {
        // const { id: userId } = req.user;
        const accept = await this.friendService.acceptFriendRequest(
            requestId,
            accepterId,
        );
        return {
            statusCode: HttpStatus.OK,
            message: "친구 요청을 수락했습니다.",
            data: accept,
        };
    }

    @Delete("/:requestId/decline/:accepterId")
    async declineFriendRequest(
        @Req() req,
        @Param("requestId") requestId: number,
        @Param("accepterId") accepterId: number,
    ) {
        // const { id: userId } = req.user;
        const decline = await this.friendService.declineFriendRequest(
            requestId,
            accepterId,
        );
        return {
            statusCode: HttpStatus.OK,
            message: "친구 요청을 거절했습니다.",
            data: decline,
        };
    }

    @Delete("/:requestId/delete/:accepterId")
    async deleteFriend(
        @Req() req,
        @Param("requestId") requestId: number,
        @Param("accepterId") accepterId: number,
    ) {
        // const { id: userId } = req.user;
        const deleteUser = await this.friendService.deleteFriend(
            requestId,
            accepterId,
        );
        return {
            statusCode: HttpStatus.OK,
            message: "친구를 삭제했습니다.",
            data: deleteUser,
        };
    }

    @Post("/:requestId/block/:accepterId")
    async blockUser(
        @Req() req,
        @Param("requestId") requestId: number,
        @Param("accepterId") accepterId: number,
    ) {
        // const { id: userId } = req.user;
        const block = await this.friendService.blockUser(requestId, accepterId);
        return {
            statusCode: HttpStatus.CREATED,
            message: "사용자를 차단했습니다.",
            data: block,
        };
    }

    @Post("/:requestId/unblock/:accepterId")
    async unblockUser(
        @Req() req,
        @Param("requestId") requestId: number,
        @Param("accepterId") accepterId: number,
    ) {
        // const { id: userId } = req.user;
        const unblock = await this.friendService.unblockUser(
            requestId,
            accepterId,
        );
        return {
            statusCode: HttpStatus.OK,
            message: "사용자 차단을 해제했습니다.",
            data: unblock,
        };
    }

    // 신고 추후 다시 결정
    // @Post("/:requestId/report/:accepterId")
    // async reportUser(
    //     @Req() req,
    //     @Param("requestId") requestId: number,
    //     @Param("accepterId") accepterId: number,
    // ) {
    //     // const { id: userId } = req.user;
    //     const report = await this.friendService.reportUser(
    //         requestId,
    //         accepterId,
    //     );
    //     return {
    //         statusCode: HttpStatus.CREATED,
    //         message: "사용자를 신고했습니다.",
    //         data: report,
    //     };
    // }

    @Get("/:requestId/friends")
    async getFriendList(@Param("requestId") requestId: number) {
        const friends = await this.friendService.getFriendList(requestId);
        return {
            statusCode: HttpStatus.OK,
            message: "친구를 조회했습니다.",
            data: friends,
        };
    }

    @Get("/:requestId/blocked-users")
    async getBlockedUsers(@Param("requestId") requestId: number) {
        const blockedUsers =
            await this.friendService.getBlockedUsers(requestId);
        return {
            statusCode: HttpStatus.OK,
            message: "차단 목록을 조회했습니다.",
            data: blockedUsers,
        };
    }
}
