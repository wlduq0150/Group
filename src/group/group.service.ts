import { Injectable } from "@nestjs/common";
import { CreateGroupDto } from "./dto/create-group.dto";
import { Group } from "./interface/group.interface";
import { initGroupState } from "./function/init-group-state.function";
import { GroupState } from "./interface/group-state.interface";
import { Position } from "./type/position.type";
import { checkIsUserPositionSelect } from "./function/check-position-select.function";
import { WsException } from "./exception/ws-exception.exception";
import { Server, Socket } from "socket.io";

@Injectable()
export class GroupService {
    groups: Map<string, Group | GroupState> = new Map();

    async createGroup(groupId: string, createGroupDto: CreateGroupDto) {
        const { name, mode, mic, owner, position } = createGroupDto;

        const groupInfoKey = `group-${groupId}`;
        const groupStateKey = `group-${groupId}-state`;

        const group: Group = { name, mode, mic, owner };
        const groupState = initGroupState(position);

        this.groups.set(groupInfoKey, group);
        this.groups.set(groupStateKey, groupState);

        return group;
    }

    async findGroupInfoById(groupId: string) {
        const groupInfoKey = `group-${groupId}`;
        const group = this.groups.get(groupInfoKey);

        if (!group) {
            throw new WsException("존재하지 않는 그룹입니다.");
        }

        return group;
    }

    async findGroupStateById(groupId: string) {
        const groupStateKey = `group-${groupId}-state`;

        const group = this.groups.get(groupStateKey);

        if (!group) {
            throw new WsException("존재하지 않는 그룹입니다.");
        }

        return group;
    }

    removeGroup(groupId: string) {
        const groupInfoKey = `group-${groupId}`;
        const groupStateKey = `group-${groupId}-state`;

        this.groups.delete(groupInfoKey);
        this.groups.delete(groupStateKey);

        return true;
    }

    async joinGroup(groupId: string, userId: number) {
        const groupStateKey = `group-${groupId}-state`;

        const groupState = this.groups.get(groupStateKey) as GroupState;

        if (groupState.currentUser >= groupState.totalUser) {
            throw new WsException(
                "그룹 인원수 제한으로 인해 참여할 수 없습니다.",
            );
        }

        groupState.currentUser += 1;

        this.groups.set(groupStateKey, groupState);

        return groupState;
    }

    async leaveGroup(groupId: string, userId: number) {
        const groupInfoKey = `group-${groupId}`;
        const groupStateKey = `group-${groupId}-state`;

        const groupState = this.groups.get(groupStateKey) as GroupState;

        // 현재 포지션을 선택한 상태라면 포지션 해제
        const pos = checkIsUserPositionSelect(groupState, userId);
        if (pos !== "none") {
            this.deselectPosition(groupId, userId, pos);
        }

        // 유저 나가기
        groupState.currentUser -= 1;

        // 해당 그룹의 지속 여부
        const isGroupEmpty = groupState.currentUser > 0 ? false : true;

        if (isGroupEmpty) {
            this.groups.delete(groupInfoKey);
            this.groups.delete(groupStateKey);
            return null;
        } else {
            this.groups.set(groupStateKey, groupState);
            return groupState;
        }
    }

    // 레디스를 사용하는데 트랜잭션을 통한 동시성 처리가 필요하다면?
    async selectPosition(groupId: string, userId: number, position: Position) {
        const groupStateKey = `group-${groupId}-state`;

        const groupState = this.groups.get(groupStateKey) as GroupState;

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

        return groupState;
    }

    async deselectPosition(
        groupId: string,
        userId: number,
        position: Position,
    ) {
        const groupStateKey = `group-${groupId}-state`;

        const groupState = this.groups.get(groupStateKey) as GroupState;

        if (!groupState[position].isActive) {
            throw new WsException("해당 포지션은 선택할 수 없습니다.");
        }

        if (groupState[position].userId !== userId) {
            throw new WsException("포지션을 선택하지 않았습니다.");
        }

        groupState[position].userId = null;

        return groupState;
    }
}
