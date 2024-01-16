import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";
import { RedisService } from "src/redis/redis.service";
import { Repository } from "typeorm";

@Injectable()
export class FriendService {
    private readonly redisClient;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly redisService: RedisService,
    ) {
        this.redisClient = this.redisService.getRedisClient();
    }

    async sendFriendRequest(senderId: number, friendId: number) {
        if (senderId === friendId) {
            throw new ConflictException("자기 자신에게 보낼 수 없습니다.");
        }

        // await this.checkFriendRequestExists(senderId, friendId);

        const friendRequestKey = this.getFriendRequestKey(senderId, friendId);
        await this.redisClient.set(friendRequestKey, "pending", "EX", 86400);

        return { senderId, friendId };
    }

    async acceptFriendRequest(userId: number, requestId: number) {
        const user = await this.getUserById(userId);
        const requester = await this.getUserById(requestId);

        user.friends.push(requester);
        requester.friends.push(user);
    }

    async declineFriendRequest(userId: number, requestId: number) {
        await this.checkFriendRequestExists(userId, requestId);

        const friendRequestKey = this.getFriendRequestKey(userId, requestId);
        await this.redisClient.del(friendRequestKey);
    }

    async deleteFriend(userId: number, friendId: number): Promise<void> {
        const user = await this.getUserById(userId);
        const friend = await this.getUserById(friendId);

        user.friends = user.friends.filter((f) => f.id !== friendId);

        friend.friends = friend.friends.filter((u) => u.id !== userId);

        await this.userRepository.save([user, friend]);
    }

    async blockUser(userId: number, userIdToBlock: number): Promise<void> {
        const user = await this.getUserById(userId);
        const userToBlock = await this.getUserById(userIdToBlock);

        user.blockedUsers.push(userToBlock);

        await this.userRepository.save(user);
    }

    async reportUser(userId: number, reportedUserId: number): Promise<void> {
        const user = await this.getUserById(userId);
        const reportedUser = await this.getUserById(reportedUserId);

        const alreadyReported = user.reportedUsers.some(
            (reported) => reported.id === reportedUserId,
        );
        if (alreadyReported) {
            throw new ConflictException("이미 해당 사용자를 신고했습니다.");
        }

        user.reportedUsers.push(reportedUser);
        user.reportCount++;

        const reportLimit = 5;
        if (user.reportCount >= reportLimit) {
            user.isSuspended = true;
        }

        await this.userRepository.save(user);
    }

    async getFriendList(userId: number): Promise<User[]> {
        const user = await this.getUserById(userId);
        return user.friends;
    }

    async getBlockedUsers(userId: number): Promise<User[]> {
        const user = await this.getUserById(userId);
        return user.blockedUsers;
    }

    async getUserById(userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException("해당하는 사용자를 찾을 수 없습니다.");
        }

        return user;
    }

    async checkFriendRequestExists(senderId: number, friendId: number) {
        const friendRequestKey = this.getFriendRequestKey(senderId, friendId);
        const friendRequestExists =
            await this.redisClient.exists(friendRequestKey);

        if (!friendRequestExists) {
            throw new NotFoundException(
                "해당하는 친구 신청이 존재하지 않습니다.",
            );
        }
    }

    private getFriendRequestKey(senderId: number, friendId: number) {
        return `friend-request:${senderId}:${friendId}`;
    }
}
