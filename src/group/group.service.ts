import { Injectable } from "@nestjs/common";
import { CreateGroupDto } from "./dto/create-group.dto";
import { Group } from "./interface/group.interface";
import { initGroupState } from "./function/init-group-state.function";
import { GroupState } from "./interface/group-state.interface";
import { Position } from "./type/position.type";
import { checkIsUserPositionSelect } from "./function/check-position-select.function";
import { WsException } from "./exception/ws-exception.exception";
import { Server, Socket } from "socket.io";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class GroupService {
    constructor(private readonly redisService: RedisService) {}

    async clear() {
        await this.redisService.clear();
    }

    async getAll() {
        return await this.redisService.getAll();
    }

    async createGroup(groupId: string, createGroupDto: CreateGroupDto) {
        const { name, mode, mic, owner, position } = createGroupDto;

        const groupInfoKey = `group-${groupId}`;
        const groupStateKey = `group-${groupId}-state`;

        const group: Group = { name, mode, mic, owner };
        const groupState = initGroupState(position);

        await this.redisService.set(groupInfoKey, JSON.stringify(group));
        await this.redisService.set(groupStateKey, JSON.stringify(groupState));

        return group;
    }

    // 유저 아이디를 통해 해당 유저가 방장인 그룹Id를 반환(없을 경우 null 반환)
    async findGroupIdByOwner(userId: number) {
        const redisClient = this.redisService.getRedisClient();
        const keys = await redisClient.keys("group-*#");

        for (let key of keys) {
            const groupId = key.replace("group-", "");
            const group = await this.findGroupInfoById(groupId);

            if (group.owner === userId) {
                return groupId;
            }
        }

        return null;
    }

    async findGroupInfoById(groupId: string) {
        const groupInfoKey = `group-${groupId}`;
        const data = await this.redisService.get(groupInfoKey);
        const group: Group = JSON.parse(data);

        if (!group) {
            throw new WsException("존재하지 않는 그룹입니다.");
        }

        return group;
    }

    async findGroupStateById(groupId: string) {
        const groupStateKey = `group-${groupId}-state`;

        const data = await this.redisService.get(groupStateKey);
        const groupState: GroupState = JSON.parse(data);

        if (!groupState) {
            throw new WsException("존재하지 않는 그룹입니다.");
        }

        return groupState;
    }

    async removeGroup(groupId: string) {
        const groupInfoKey = `group-${groupId}`;
        const groupStateKey = `group-${groupId}-state`;

        await this.redisService.del(groupInfoKey);
        await this.redisService.del(groupStateKey);

        return true;
    }

    // userId 지우기
    async joinGroup(groupId: string) {
        const groupStateKey = `group-${groupId}-state`;

        const groupState = await this.findGroupStateById(groupId);

        if (groupState.currentUser >= groupState.totalUser) {
            throw new WsException(
                "그룹 인원수 제한으로 인해 참여할 수 없습니다.",
            );
        }

        groupState.currentUser += 1;

        this.redisService.set(groupStateKey, JSON.stringify(groupState));

        return groupState;
    }

    async leaveGroup(groupId: string, userId: number) {
        const groupInfoKey = `group-${groupId}`;
        const groupStateKey = `group-${groupId}-state`;

        const groupState = await this.findGroupStateById(groupId);

        // 현재 포지션을 선택한 상태라면 포지션 해제
        const pos = checkIsUserPositionSelect(groupState, userId);
        if (pos !== "none") {
            await this.deselectPosition(groupId, userId, pos);
        }

        // 유저 나가기
        groupState.currentUser -= 1;

        // 해당 그룹의 지속 여부
        const isGroupEmpty = groupState.currentUser > 0 ? false : true;

        if (isGroupEmpty) {
            await this.redisService.del(groupInfoKey);
            await this.redisService.del(groupStateKey);
            return null;
        } else {
            await this.redisService.set(
                groupStateKey,
                JSON.stringify(groupState),
            );
            return groupState;
        }
    }

    // 레디스의 multi와 watch를 통해 트랜잭션과 락 구현
    // async selectPosition(groupId: string, userId: number, position: Position) {
    //     const groupStateKey = `group-${groupId}-state`;

    //     const redisClient = this.redisService.getRedisClient();

    //     redisClient.watch(groupStateKey);

    //     const transaction = redisClient.multi();

    //     let groupState: GroupState;

    //     await transaction
    //         .get(groupStateKey, async (err, result) => {
    //             groupState = await this.findGroupStateById(groupId);
    //             console.log(groupState);
    //             groupState[position].userId = userId;
    //         })
    //         .set(groupStateKey, JSON.stringify(groupState))
    //         .exec((err, data: any) => {
    //             groupState = JSON.parse(data[0][1]);

    //             try {
    //                 if (err) {
    //                     throw new WsException(err.message);
    //                 }

    //                 if (!groupState) {
    //                     throw new WsException("그룹이 존재하지 않습니다.");
    //                 }

    //                 if (!groupState[position].isActive) {
    //                     throw new WsException(
    //                         "해당 포지션은 선택할 수 없습니다.",
    //                     );
    //                 }

    //                 if (groupState[position].userId !== null) {
    //                     throw new WsException(
    //                         "다른 사용자가 이미 해당 포지션을 선택했습니다.",
    //                     );
    //                 }

    //                 if (
    //                     checkIsUserPositionSelect(groupState, userId) !== "none"
    //                 ) {
    //                     throw new WsException("이미 포지션을 선택했습니다.");
    //                 }
    //             } catch (e) {
    //                 transaction.discard();
    //                 throw e;
    //             }
    //         });

    //     return groupState;
    // }

    // async selectPosition(groupId: string, userId: number, position: Position) {
    //     const groupStateKey = `group-${groupId}-state`;
    //     const groupStateLockKey = `group-${groupId}-state-lock`;

    //     const groupStateLock = await this.redisService.get(groupStateLockKey);
    //     if (groupStateLock === "1") {
    //         throw new WsException("다른 유저가 선택중입니다.");
    //     }

    //     console.log(position, "잠금해제");

    //     const groupState = await this.findGroupStateById(groupId);
    //     await this.redisService.set(groupStateLockKey, "1");
    //     console.log(groupState, position);

    //     if (!groupState) {
    //         throw new WsException("그룹이 존재하지 않습니다.");
    //     }

    //     if (!groupState[position].isActive) {
    //         throw new WsException("해당 포지션은 선택할 수 없습니다.");
    //     }

    //     if (groupState[position].userId !== null) {
    //         throw new WsException(
    //             "다른 사용자가 이미 해당 포지션을 선택했습니다.",
    //         );
    //     }

    //     if (checkIsUserPositionSelect(groupState, userId) !== "none") {
    //         throw new WsException("이미 포지션을 선택했습니다.");
    //     }

    //     groupState[position].userId = userId;
    //     await this.redisService.set(groupStateKey, groupState);

    //     await this.redisService.set(groupStateLockKey, "0");

    //     console.log(position, "완료");

    //     return groupState;
    // }

    // async selectPosition(groupId: string, userId: number, position: Position) {
    //     const groupStateKey = `group-${groupId}-state`;
    //     const groupStateLockKey = `group-${groupId}-state-lock`;

    //     const redisClient = this.redisService.getRedisClient();
    //     const transaction = redisClient.multi();

    //     let groupState: GroupState;
    //     let exception: WsException;

    //     await transaction
    //         .get(groupStateLockKey)
    //         .exec(async (err, data: any) => {
    //             const groupStateLock = JSON.parse(data[0][1]);

    //             if (groupStateLock === "1") {
    //                 exception = new WsException("다른 유저가 선택중입니다.");
    //             }

    //             await this.redisService.set(groupStateLockKey, "1");
    //             console.log(position, "잠금");

    //             groupState = await this.findGroupStateById(groupId);
    //             console.log(groupState, position);

    //             if (!groupState) {
    //                 exception = new WsException("그룹이 존재하지 않습니다.");
    //             }

    //             if (!groupState[position].isActive) {
    //                 exception = new WsException(
    //                     "해당 포지션은 선택할 수 없습니다.",
    //                 );
    //             }

    //             if (groupState[position].userId !== null) {
    //                 exception = new WsException(
    //                     "다른 사용자가 이미 해당 포지션을 선택했습니다.",
    //                 );
    //             }

    //             if (checkIsUserPositionSelect(groupState, userId) !== "none") {
    //                 exception = new WsException("이미 포지션을 선택했습니다.");
    //             }

    //             groupState[position].userId = userId;
    //             await this.redisService.set(groupStateKey, groupState);

    //             await this.redisService.set(groupStateLockKey, "0");
    //         });
    //     if (exception) {
    //         throw exception;
    //     }
    //     console.log(position, "완료");

    //     return groupState;
    // }

    async selectPosition(groupId: string, userId: number, position: Position) {
        const groupStateKey = `group-${groupId}-state`;
        const groupStateErrorKey = `group-${groupId}-state-error`;

        const redisClient = this.redisService.getRedisClient();

        let wsException: WsException;

        redisClient.defineCommand("selectPosition", {
            numberOfKeys: 2,
            lua: `
                local data = redis.call('GET', KEYS[1])
                local groupState = cjson.decode(data) or {}

                local position = ARGV[1]
                local userId = tonumber(ARGV[2])

                if not groupState[position] then
                    redis.call('SET', KEYS[2], cjson.encode(groupState[position]))
                    return
                end

                groupState[position].userId = userId
                redis.call('SET', KEYS[1], cjson.encode(groupState))

                return groupState
            `,
        });

        redisClient.multi({ pipeline: false });
        //@ts-ignore
        redisClient.selectPosition(
            groupStateKey,
            groupStateErrorKey,
            position,
            userId,
        );
        redisClient.get(groupStateErrorKey);
        await redisClient.exec((err, results: any) => {
            console.log("에러: ", err);
            console.log("결과: ", results);

            const errorMessage: string = results[1][1];
            if (errorMessage !== null) {
                wsException = new WsException(errorMessage);
            }
        });

        if (wsException) {
            throw wsException;
        }

        const groupState = await this.findGroupStateById(groupId);
        console.log(groupState, "완료");

        return groupState;
    }

    async deselectPosition(
        groupId: string,
        userId: number,
        position: Position,
    ) {
        const groupStateKey = `group-${groupId}-state`;

        const groupState = await this.findGroupStateById(groupId);

        if (!groupState[position].isActive) {
            throw new WsException("해당 포지션은 선택할 수 없습니다.");
        }

        if (groupState[position].userId !== userId) {
            console.log(groupState);
            throw new WsException("포지션을 선택하지 않았습니다.");
        }

        groupState[position].userId = null;

        await this.redisService.set(groupStateKey, JSON.stringify(groupState));

        return groupState;
    }
}
