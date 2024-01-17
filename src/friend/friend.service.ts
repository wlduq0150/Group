import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";
import { RedisService } from "src/redis/redis.service";
import { Repository } from "typeorm";
import IORedis from "ioredis";
import { send } from "process";
@Injectable()
export class FriendService {
    private readonly redisClient: IORedis;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly redisService: RedisService,
    ) {
        this.redisClient = this.redisService.getRedisClient();
    }

    async test(key: string) {
        try {
            const redisClient = this.redisService.getRedisClient();
            const data = await redisClient.get(key);
            return data;
        } catch (error) {
            throw new Error("Redis에서 데이터를 가져오는 데 실패했습니다");
        }
    }

    async sendFriendRequest(senderId: number, friendId: number) {
        if (senderId === friendId) {
            throw new ConflictException("자기 자신에게 보낼 수 없습니다.");
        }
        const user = await this.getUserById(senderId);
        const requester = await this.getUserById(friendId);

        const friendRequestKey = this.getFriendRequestKey(senderId, friendId);

        const friendRequest = { senderId, friendId };
        await this.redisClient.set(
            friendRequestKey,
            JSON.stringify(friendRequest),
            "EX",
            86400,
        );

        return { user, requester };
    }

    async acceptFriendRequest(requestId: number, accepterId: number) {
        const key = await this.checkFriendRequestExists(requestId, accepterId);
        console.log("수락키", key);
        const accepter = await this.getUserById(accepterId);
        const requester = await this.getUserById(requestId);

        accepter.friends = [...accepter.friends, requester];
        console.log("친구", accepter.friends);

        await this.userRepository.save(accepter);

        await this.redisService.del(key);
    }

    async declineFriendRequest(requestId: number, accepterId: number) {
        const friendRequestKey = await this.checkFriendRequestExists(
            requestId,
            accepterId,
        );

        // const friendRequestKey = this.getFriendRequestKey(userId, requestId);
        await this.redisService.del(friendRequestKey);
    }

    async deleteFriend(requestId: number, accepterId: number) {
        const user = await this.getUserById(requestId);
        const friend = await this.getUserById(accepterId);

        user.friends = user.friends.filter((f) => f.id !== accepterId);

        friend.friends = friend.friends.filter((u) => u.id !== requestId);

        await this.userRepository.save([user, friend]);
    }

    async blockUser(requestId: number, accepterId: number) {
        const user = await this.getUserById(requestId);
        const userToBlock = await this.getUserById(accepterId);

        user.blockedUsers = [...user.blockedUsers, userToBlock];

        // user.blockedUsers.push(userToBlock);

        await this.userRepository.save(user);
    }

    // 신고 추후 다시 결정
    // async reportUser(requestId: number, accepterId: number) {
    //     const user = await this.getUserById(requestId);
    //     const reportedUser = await this.getUserById(accepterId);

    //     const alreadyReported = user.reportedUsers.some(
    //         (reported) => reported.id === accepterId,
    //     );

    //     if (alreadyReported) {
    //         throw new ConflictException("이미 해당 사용자를 신고했습니다.");
    //     }

    //     user.reportedUsers.push(reportedUser);
    //     user.reportCount++;

    //     const reportLimit = 5;
    //     if (user.reportCount >= reportLimit) {
    //         user.isSuspended = true;
    //     }

    //     await this.userRepository.save(user);
    // }

    async getFriendList(requestId: number): Promise<User[]> {
        const user = await this.getUserById(requestId);
        return user.friends;
    }

    async getBlockedUsers(requestId: number): Promise<User[]> {
        const user = await this.getUserById(requestId);
        return user.blockedUsers;
    }

    async getUserById(requestId: number) {
        const user = await this.userRepository.findOne({
            where: { id: requestId },
            relations: {
                friends: true,
                blockedUsers: true,
                reportedUsers: true,
            },
        });

        if (!user) {
            throw new NotFoundException("해당하는 사용자를 찾을 수 없습니다.");
        }

        return user;
    }

    async checkFriendRequestExists(senderId: number, friendId: number) {
        console.log("둘다", senderId, friendId);
        const friendRequestKey = this.getFriendRequestKey(senderId, friendId);
        const friendRequestExists =
            await this.redisService.get(friendRequestKey);

        if (!friendRequestExists) {
            throw new NotFoundException(
                "해당하는 친구 신청이 존재하지 않습니다.",
            );
        }
        return friendRequestKey;
    }

    private getFriendRequestKey(senderId: number, friendId: number) {
        return `friend-request:${senderId}:${friendId}`;
    }
}
