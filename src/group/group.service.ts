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

        await this.redisService.delete(groupInfoKey);
        await this.redisService.delete(groupStateKey);

        return true;
    }

    async joinGroup(groupId: string, userId: number) {
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
            await this.redisService.delete(groupInfoKey);
            await this.redisService.delete(groupStateKey);
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
    async selectPosition(groupId: string, userId: number, position: Position) {
        const groupStateKey = `group-${groupId}-state`;

        const redisClient = this.redisService.getRedisClient();
        const transaction = redisClient.multi();

        let groupState: GroupState;

        await transaction.get(groupStateKey).exec((err, data: any) => {
            groupState = JSON.parse(data[0][1]);

            try {
                let count: number;
                if (userId === 1) count = 5000000000;
                else count = 500;

                for (let i = 0; i < count; i++) {
                    const a = 10000 + 20000;
                }

                if (err) {
                    throw new WsException(err.message);
                }

                if (!groupState) {
                    throw new WsException("그룹이 존재하지 않습니다.");
                }

                if (!groupState[position].isActive) {
                    throw new WsException("해당 포지션은 선택할 수 없습니다.");
                }

                if (groupState[position].userId !== null) {
                    throw new WsException(
                        "다른 사용자가 이미 해당 포지션을 선택했습니다.",
                    );
                }

                if (checkIsUserPositionSelect(groupState, userId) !== "none") {
                    throw new WsException("이미 포지션을 선택했습니다.");
                }

                groupState[position].userId = userId;

                transaction.set(groupStateKey, JSON.stringify(groupState));
                transaction.exec();
            } catch (e) {
                transaction.discard();
                throw e;
            }
        });

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
            throw new WsException("포지션을 선택하지 않았습니다.");
        }

        groupState[position].userId = null;

        await this.redisService.set(groupStateKey, JSON.stringify(groupState));

        return groupState;
    }
}
