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
import { UserService } from "src/user/user.service";
import { randomBytes } from "crypto";
@Injectable()
export class FriendService {
    private readonly redisClient: IORedis;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly redisService: RedisService,
        private readonly userService: UserService,
    ) {
        this.redisClient = this.redisService.getRedisClient();
    }

    // 키 확인 테스트
    async test(key: string) {
        try {
            const redisClient = this.redisService.getRedisClient();
            const data = await redisClient.get(key);
            return data;
        } catch (error) {
            throw new Error("Redis에서 데이터를 가져오는 데 실패했습니다");
        }
    }

    // 친구 요청
    async initiateFriendRequest(myId: string, friendId: number) {
        if (+myId == friendId) {
            throw new ConflictException("자기 자신에게 보낼 수 없습니다.");
        }

        const senderId = (await this.userService.findOneByDiscordId(myId)).id;

        if (!senderId) {
            throw new NotFoundException("사용자를 찾을 수 없습니다.");
        }

        const [user, requester] = await Promise.all([
            this.getUserById(senderId),
            this.getUserById(friendId),
        ]);

        const friendRequestKey = this.getFriendRequestKey(senderId, friendId);

        const friendRequest = { senderId, friendId };

        const oneDaySeconds = 86400;

        await this.redisClient.set(
            friendRequestKey,
            JSON.stringify(friendRequest),
            "EX",
            oneDaySeconds,
        );

        return { user, requester };
    }

    // 친구 요청 수락
    async acceptFriendRequest(requestId: number, accepterId: number) {
        const key = await this.checkFriendRequestExists(requestId, accepterId);

        const [accepter, requester] = await Promise.all([
            this.getUserById(requestId),
            this.getUserById(accepterId),
        ]);

        accepter.friends = [...accepter.friends, requester];

        await this.userRepository.save(accepter);

        await this.redisService.del(key);
    }

    // 친구 요청 거절
    async declineFriendRequest(requestId: number, myId: number) {
        const friendRequestKey = await this.checkFriendRequestExists(
            requestId,
            myId,
        );

        await this.redisService.del(friendRequestKey);
    }

    // 친구 삭제
    async deleteFriend(requestId: number, myId: number) {
        const [user, friend] = await Promise.all([
            this.getUserById(requestId),
            this.getUserById(myId),
        ]);

        user.friends = user.friends.filter((f) => f.id !== myId);

        friend.friends = friend.friends.filter((u) => u.id !== requestId);

        await this.userRepository.save([user, friend]);
    }

    // 유저 차단
    async blockUser(requestId: number, myId: number) {
        const [user, userToBlock] = await Promise.all([
            this.getUserById(requestId),
            this.getUserById(myId),
        ]);

        const isBlocked = user.blockedUsers.some(
            (blockedUser) => blockedUser.id === myId,
        );

        if (!isBlocked) {
            user.blockedUsers = [...user.blockedUsers, userToBlock];

            await this.userRepository.save(user);
        } else {
            throw new NotFoundException("이미 차단된 사용자입니다.");
        }
    }

    // 유저 차단 해제
    async unblockUser(requestId: number, myId: number) {
        const [user, userToUnblock] = await Promise.all([
            this.getUserById(requestId),
            this.getUserById(myId),
        ]);

        const isBlocked = user.blockedUsers.some(
            (blockedUser) => blockedUser.id === myId,
        );

        if (!isBlocked) {
            throw new NotFoundException("차단되어 있지 않은 사용자입니다.");
        }

        user.blockedUsers = user.blockedUsers.filter(
            (blockedUser) => blockedUser.id !== myId,
        );

        await this.userRepository.save(user);
    }

    async getFriendList(requestId: number) {
        const user = await this.getUserById(requestId);
        return user.friends;
    }

    async getBlockedUsers(requestId: number) {
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

    // 친구 요청 키 체크
    async checkFriendRequestExists(senderId: number, friendId: number) {
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

    // 친구 요청 키 생성
    private getFriendRequestKey(senderId: number, friendId: number) {
        const randomToken = this.generateRandomToken();
        return `friend-request:${senderId}:${friendId}:${randomToken}`;
    }

    // 랜덤 키 생성
    private generateRandomToken() {
        return randomBytes(16).toString("hex");
    }
}
