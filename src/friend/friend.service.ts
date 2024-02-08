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
import { SendMessage } from "src/entity/sendMessage.entity";
import { SendMessageType } from "./interface/sendMessage.interface";
import { MessageRoom } from "src/entity/messageRoom.endtity";
@Injectable()
export class FriendService {
    private readonly redisClient: IORedis;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly redisService: RedisService,
        private readonly userService: UserService,
        @InjectRepository(SendMessage)
        private readonly sendMessageRepository: Repository<SendMessage>,
        @InjectRepository(MessageRoom)
        private readonly messageRoomRepository: Repository<MessageRoom>,
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
    async initiateFriendRequest(myDiscordId: string, friendId: number) {
        const senderId = (
            await this.userService.findOneByDiscordId(myDiscordId)
        ).id;

        if (+myDiscordId == friendId) {
            throw new ConflictException("자기 자신에게 보낼 수 없습니다.");
        }

        if (!senderId) {
            throw new NotFoundException("사용자를 찾을 수 없습니다.");
        }

        const [sender, requester] = await Promise.all([
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

        return { sender, requester };
    }

    // 친구 요청 수락
    async acceptFriendRequest(requestId: number, myDiscordId: string) {
        const accepterId = (
            await this.userService.findOneByDiscordId(myDiscordId)
        ).id;

        if (!accepterId) {
            throw new NotFoundException("사용자를 찾을 수 없습니다.");
        }

        const key = await this.checkFriendRequestExists(requestId, accepterId);

        const [accepter, requester] = await Promise.all([
            this.getUserById(requestId),
            this.getUserById(accepterId),
        ]);

        accepter.friends = [...accepter.friends, requester];
        requester.friends = [...requester.friends, accepter];

        await this.userRepository.save([accepter, requester]);

        await this.redisService.del(key);

        return accepterId;
    }

    // 친구 요청 거절
    async declineFriendRequest(requestId: number, myDiscordId: string) {
        const declinerId = (
            await this.userService.findOneByDiscordId(myDiscordId)
        ).id;

        if (!declinerId) {
            throw new NotFoundException("사용자를 찾을 수 없습니다.");
        }

        const friendRequestKey = await this.checkFriendRequestExists(
            requestId,
            declinerId,
        );

        await this.redisService.del(friendRequestKey);
    }

    // 친구 삭제
    async deleteFriend(requestId: number, myDiscordId: string) {
        const deleterId = (
            await this.userService.findOneByDiscordId(myDiscordId)
        ).id;

        if (!deleterId) {
            throw new NotFoundException("사용자를 찾을 수 없습니다.");
        }

        const [user, friend] = await Promise.all([
            this.getUserById(deleterId),
            this.getUserById(requestId),
        ]);

        const checkFriend = user.friends.some((f) => f.id === requestId);

        if (!checkFriend) {
            throw new NotFoundException("이미 친구가 아닙니다.");
        }

        user.friends = user.friends.filter((f) => f.id !== requestId);

        friend.friends = friend.friends.filter((u) => u.id !== deleterId);

        await this.userRepository.save([user, friend]);
    }

    // 유저 차단
    async blockUser(requestId: number, myDiscordId: string) {
        const blockerId = (
            await this.userService.findOneByDiscordId(myDiscordId)
        ).id;

        if (!blockerId) {
            throw new NotFoundException("사용자를 찾을 수 없습니다.");
        }

        const [user, userToBlock] = await Promise.all([
            this.getUserById(blockerId),
            this.getUserById(requestId),
        ]);

        const isBlocked = user.blockedUsers.some(
            (blockedUser) => blockedUser.id === requestId,
        );

        if (!isBlocked) {
            user.blockedUsers = [...user.blockedUsers, userToBlock];

            await this.userRepository.save(user);
        } else {
            throw new ConflictException("이미 차단된 사용자입니다.");
        }
    }

    // 유저 차단 해제
    async unblockUser(requestId: number, myDiscordId: string) {
        const unblockerId = (
            await this.userService.findOneByDiscordId(myDiscordId)
        ).id;

        if (!unblockerId) {
            throw new NotFoundException("사용자를 찾을 수 없습니다.");
        }

        const [user, userToUnblock] = await Promise.all([
            this.getUserById(unblockerId),
            this.getUserById(requestId),
        ]);

        const isBlocked = user.blockedUsers.some(
            (blockedUser) => blockedUser.id === requestId,
        );

        if (!isBlocked) {
            throw new NotFoundException("차단되어 있지 않은 사용자입니다.");
        }

        user.blockedUsers = user.blockedUsers.filter(
            (blockedUser) => blockedUser.id !== requestId,
        );

        await this.userRepository.save(user);
    }

    async getFriendList(myDiscordId: string) {
        const myId = (await this.userService.findOneByDiscordId(myDiscordId))
            .id;

        if (!myId) {
            throw new NotFoundException("사용자를 찾을 수 없습니다.");
        }

        const user = await this.getUserById(myId);
        return user.friends;
    }

    async getFriendRequestList(myDiscordId: string) {
        const myId = (await this.userService.findOneByDiscordId(myDiscordId))
            .id;

        if (!myId) {
            throw new NotFoundException("사용자를 찾을 수 없습니다.");
        }

        const requests = await this.redisClient.keys(
            `friend-request:*:${myId}`,
        );

        const requesters = [];

        for (let req of requests) {
            const requesterId = +req
                .replace("friend-request:", "")
                .split(":")[0];

            const requester = await this.userService.findOneById(requesterId);
            requesters.push({
                id: requesterId,
                discordName: requester.username,
                loltag: requester.lolUser ? requester.lolUser.nameTag : null,
            });
        }

        return requesters;
    }

    async getBlockedUsers(myDiscordId: string) {
        const myId = (await this.userService.findOneByDiscordId(myDiscordId))
            .id;

        if (!myId) {
            throw new NotFoundException("사용자를 찾을 수 없습니다.");
        }

        const user = await this.getUserById(myId);
        return user.blockedUsers;
    }

    async getUserById(requestId: number) {
        const user = await this.userRepository.findOne({
            where: { id: requestId },
            relations: {
                friends: true,
                blockedUsers: true,
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
        return `friend-request:${senderId}:${friendId}`;
    }

    //메세지 비동기적 저장
    saveOneMessage(sendMessages: SendMessageType) {
        this.sendMessageRepository.save(sendMessages);
    }

    //메세지방 확인 및 없으면 생성 메세지 모든 반환
    async getAllMessages(userOne: number, userTwo: number) {
        const { smallId, bigId } = this.comparisonId(userOne, userTwo);

        const checkRoom = await this.findMessageRoom(smallId, bigId);
        if (!checkRoom) {
            return await this.createMessageRoom(smallId, bigId);
        }
        return checkRoom;
    }

    //메세지방 id만 반환
    async getMessageRoomId(userOne: number, userTwo: number) {
        const { smallId, bigId } = this.comparisonId(userOne, userTwo);
        return await this.messageRoomRepository.findOneBy({ smallId, bigId });
    }

    //id두개 비교해서 큰것 작은것 반환
    private comparisonId(userOne: number, userTwo: number) {
        let smallId: number, bigId: number;
        if (userOne > userTwo) {
            bigId = userOne;
            smallId = userTwo;
        } else {
            bigId = userTwo;
            smallId = userOne;
        }
        return { smallId, bigId };
    }

    //db에 메세지를 redis에 저장
    async setMessageRedis(userOne: number, userTwo: number) {
        const room = await this.getMessageRoomId(userOne, userTwo);
        const checkRoom = await this.redisService.getlrange(
            `messageRoom:${room.id}`,
        );
        //현재 레디스에 정보가 있으면 레디스 반환 아니면 레디스에 저장후 반환
        if (checkRoom.length) {
            return checkRoom;
        } else {
            const messages = await this.getAllMessages(userOne, userTwo);
            await this.redisService.arrayRpush(
                `messageRoom:${room.id}`,
                messages.sendMessage,
            );
            return messages.sendMessage;
        }
    }

    //레디스의 리스트로 저장된 값 가져오기
    async getlrange(id: number) {
        return await this.redisService.getlrange(`messageRoom:${id}`);
    }

    //redis에 새 채팅 저장
    async saveNewMessageRedis(roomId: number, message: SendMessageType) {
        await this.redisService.rpush(`messageRoom:${roomId}`, message);
    }

    //메세지방 생성
    private async createMessageRoom(smallId: number, bigId: number) {
        await this.messageRoomRepository.save({ smallId, bigId });
        return await this.findMessageRoom(smallId, bigId);
    }

    //메세지방+메세지 검색
    private async findMessageRoom(smallId: number, bigId: number) {
        return await this.messageRoomRepository.findOne({
            where: { bigId, smallId },
            relations: { sendMessage: true },
        });
    }
}
