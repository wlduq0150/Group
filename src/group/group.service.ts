import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { CreateGroupDto } from "./dto/create-group.dto";
import { Group } from "./interface/group.interface";
import { initGroupState } from "./function/init-group-state.function";
import { GroupState } from "./interface/group-state.interface";
import { Position } from "./type/position.type";
import { checkIsUserPositionSelect } from "./function/check-position-select.function";
import { WsException } from "./exception/ws-exception.exception";
import { RedisService } from "src/redis/redis.service";
import Redlock from "redlock";
import { DiscordService } from "src/discord/discord.service";
import { UserService } from "src/user/user.service";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { updateGroupState } from "./function/update-group-state.function";
import { POSITION_LIST } from "./constants/position.constants";
import { GroupGateway } from "./group.gateway";

@Injectable()
export class GroupService {
    private redlock: Redlock;

    constructor(
        private readonly redisService: RedisService,
        private readonly userService: UserService,
        @Inject(forwardRef(() => DiscordService))
        private readonly discordService: DiscordService,
        @Inject(forwardRef(() => GroupGateway))
        private readonly groupGateway: GroupGateway,
    ) {
        this.clear();

        this.redlock = new Redlock([redisService.getRedisClient()], {
            retryCount: 3,
            retryDelay: 300,
        });
    }

    async clear() {
        await this.redisService.clear();
    }

    private generateGroupInfoKey(groupId: string) {
        return `group:info:${groupId}`;
    }

    private generateGroupStateKey(groupId: string) {
        return `group:state:${groupId}`;
    }

    private generateGroupLockKey(groupId: string) {
        return `group:lock:${groupId}`;
    }

    async saveDataInSocket(clientId: string, attr: string, data: any) {
        await this.redisService
            .getRedisClient()
            .hset(clientId, attr, data.toString());
    }

    async getDataInSocket(clientId: string, attr: string) {
        return await this.redisService.getRedisClient().hget(clientId, attr);
    }

    async delDataInSocket(clientId: string, attr: string) {
        await this.redisService.getRedisClient().hdel(clientId, attr);
    }

    async findGroupUsers(groupId: string) {
        return await this.groupGateway.findGroupUsers(groupId);
    }

    async createGroup(groupId: string, createGroupDto: CreateGroupDto) {
        const { name, mode, people, tier, mic, owner, position } =
            createGroupDto;

        if (mode === "aram" && !people) {
            throw new WsException(
                "칼바람나락 모드에서는 인원선택이 필요합니다.",
            );
        }

        if (mode === "aram" && position.length) {
            throw new WsException(
                "칼바람나락 모드는 포지션 선택을 할 수 없습니다.",
            );
        }

        if (mode !== "aram" && position.length === 0) {
            throw new WsException("그룹원이 한명이상 필요합니다.");
        }

        const groupInfoKey = this.generateGroupInfoKey(groupId);
        const groupStateKey = this.generateGroupStateKey(groupId);

        const group: Group = { name, mode, tier, mic, owner, open: true };
        const groupState = initGroupState(position, people);

        await this.redisService.set(groupInfoKey, JSON.stringify(group));
        await this.redisService.set(groupStateKey, JSON.stringify(groupState));

        return group;
    }

    async updateGroup(
        userId: number,
        groupId: string,
        updateGroupDto: UpdateGroupDto,
    ) {
        const groupInfoKey = this.generateGroupInfoKey(groupId);
        const groupStateKey = this.generateGroupStateKey(groupId);

        let groupInfo = await this.findGroupInfoById(groupId);
        let groupState = await this.findGroupStateById(groupId);

        if (userId !== groupInfo.owner) {
            throw new WsException("그룹장만이 그룹 설정을 변경 가능합니다.");
        }

        for (let update of Object.keys(updateGroupDto)) {
            if (update === "updatePosition") {
                groupState = updateGroupState(
                    groupState,
                    updateGroupDto[update],
                );
            } else {
                if (update in groupInfo) {
                    groupInfo[update] = updateGroupDto[update];
                }
            }
        }

        await this.redisService.set(groupInfoKey, JSON.stringify(groupInfo));
        await this.redisService.set(groupStateKey, JSON.stringify(groupState));

        return { groupInfo, groupState };
    }

    // 모든 그룹 id 반환
    async findAllGroup() {
        const redisClient = this.redisService.getRedisClient();
        const infoKeys = await redisClient.keys("group:info:*");
        const stateKeys = infoKeys.map((key) => key.replace("info", "state"));
        const keys = infoKeys.map((key) => key.replace("group:info:", ""));

        if (keys.length === 0) return null;

        const [infoValues, stateValues] = await Promise.all([
            redisClient.mget(...infoKeys),
            redisClient.mget(...stateKeys),
        ]);

        const data = keys.map((key, index) => {
            return {
                [key]: {
                    groupId: key,
                    info: JSON.parse(infoValues[index]),
                    state: JSON.parse(stateValues[index]),
                },
            };
        });

        return data;
    }

    // 유저 아이디를 통해 해당 유저가 방장인 그룹Id를 반환(없을 경우 null 반환)
    async findGroupIdByOwner(userId: number) {
        const redisClient = this.redisService.getRedisClient();
        const keys = await redisClient.keys("group:info:*");

        console.log(keys);

        for (let key of keys) {
            const groupId = key.replace("group:info:", "");
            const group = await this.findGroupInfoById(groupId);

            console.log(group);

            if (group.owner === userId) {
                return groupId;
            }
        }

        return null;
    }

    async findGroupInfoById(groupId: string) {
        const groupInfoKey = this.generateGroupInfoKey(groupId);
        const data = await this.redisService.get(groupInfoKey);
        const group: Group = JSON.parse(data);

        if (!group) {
            throw new WsException("존재하지 않는 그룹입니다.");
        }

        return group;
    }

    async findGroupStateById(groupId: string) {
        const groupStateKey = this.generateGroupStateKey(groupId);

        const data = await this.redisService.get(groupStateKey);
        const groupState: GroupState = JSON.parse(data);

        if (!groupState) {
            throw new WsException("존재하지 않는 그룹입니다.");
        }

        return groupState;
    }

    async removeGroup(groupId: string) {
        const groupInfoKey = this.generateGroupInfoKey(groupId);
        const groupStateKey = this.generateGroupStateKey(groupId);

        await this.redisService.del(groupInfoKey);
        await this.redisService.del(groupStateKey);

        return true;
    }

    // userId 지우기
    async joinGroup(groupId: string) {
        const groupStateKey = this.generateGroupStateKey(groupId);
        const groupStateLockkey = this.generateGroupLockKey(groupId);

        const lock = await this.redlock.acquire([groupStateLockkey], 1000);

        const groupInfo = await this.findGroupInfoById(groupId);
        const groupState = await this.findGroupStateById(groupId);

        try {
            if (!groupInfo.open) {
                throw new Error("그룹이 현재 비공개 상태입니다.");
            }

            if (groupState.currentUser >= groupState.totalUser) {
                throw new Error(
                    "그룹 인원수 제한으로 인해 참여할 수 없습니다.",
                );
            }

            groupState.currentUser += 1;

            await this.redisService.set(
                groupStateKey,
                JSON.stringify(groupState),
            );
        } catch (e) {
            throw new WsException(e.message);
        } finally {
            await lock.release();
        }

        return groupState;
    }

    async leaveGroup(groupId: string, userId: number, users: number[]) {
        const groupInfoKey = this.generateGroupInfoKey(groupId);
        const groupStateKey = this.generateGroupStateKey(groupId);
        const groupStateLockkey = this.generateGroupLockKey(groupId);

        const lock = await this.redlock.acquire([groupStateLockkey], 1000);

        const groupInfo = await this.findGroupInfoById(groupId);
        let groupState = await this.findGroupStateById(groupId);

        try {
            // 현재 포지션을 선택한 상태라면 포지션 해제
            const pos = checkIsUserPositionSelect(groupState, userId);
            if (pos !== "none") {
                groupState = await this.deselectPosition(groupId, userId, pos);
            }

            // 유저 나가기
            groupState.currentUser -= 1;

            // 방장일 경우 새로운 방장으로 교체 (칼바람 나락이 아닐 경우)
            if (groupInfo.mode !== "aram" && groupInfo.owner === userId) {
                for (let position of POSITION_LIST) {
                    if (
                        groupState[position].isActive &&
                        groupState[position].userId
                    ) {
                        groupInfo.owner = groupState[position].userId;
                        break;
                    }
                }
            }

            // 방장일 경우 새로운 방장으로 교체 (칼바람 나락이 아닐 경우)
            if (groupInfo.mode === "aram" && groupInfo.owner === userId) {
                groupInfo.owner = users[0];
            }

            // 해당 그룹의 지속 여부
            const isGroupEmpty = groupState.currentUser > 0 ? false : true;

            if (isGroupEmpty) {
                const discordId =
                    await this.userService.findDiscordIdByUserId(userId);
                this.removeGroup(groupId);
                this.discordService.deleteVoiceChannelForGroup(
                    groupId,
                    discordId,
                );
                return null;
            } else {
                // 변화 저장
                await this.redisService.set(
                    groupInfoKey,
                    JSON.stringify(groupInfo),
                );
                await this.redisService.set(
                    groupStateKey,
                    JSON.stringify(groupState),
                );
                return groupState;
            }
        } catch (e) {
            throw new WsException(e.message);
        } finally {
            await lock.release();
        }
    }

    async selectPosition(groupId: string, userId: number, position: Position) {
        const groupStateKey = this.generateGroupStateKey(groupId);
        const groupStateLockkey = this.generateGroupLockKey(groupId);

        const redisClient = this.redisService.getRedisClient();

        const lock = await this.redlock.acquire([groupStateLockkey], 1000);

        const groupState = await this.findGroupStateById(groupId);

        try {
            if (!groupState[position].isActive) {
                throw new Error("해당 포지션은 선택할 수 없습니다.");
            }

            if (groupState[position].userId !== null) {
                throw new Error("다른 사용자가 해당 포지션을 선택했습니다.");
            }

            if (checkIsUserPositionSelect(groupState, userId) !== "none") {
                throw new Error("이미 포지션을 선택했습니다.");
            }

            groupState[position].userId = userId;

            redisClient
                .multi()
                .set(groupStateKey, JSON.stringify(groupState))
                .exec();
        } catch (e) {
            throw new WsException(e.message);
        } finally {
            // 락 해제
            await lock.release();
        }

        return groupState;
    }

    async deselectPosition(
        groupId: string,
        userId: number,
        position: Position,
    ) {
        const groupStateKey = this.generateGroupStateKey(groupId);

        const groupState = await this.findGroupStateById(groupId);

        if (!groupState[position].isActive) {
            throw new WsException("해당 포지션은 선택할 수 없습니다.");
        }

        if (groupState[position].userId !== userId) {
            throw new WsException("포지션을 선택하지 않았습니다.");
        }

        groupState[position].userId = null;

        await this.redisService.set(groupStateKey, JSON.stringify(groupState));

        return groupState;
    }

    async createGroupChat(userId: number, message: string) {
        const name = await this.userService.findNameByUserId(userId);

        return { userId, name, message };
    }
}
