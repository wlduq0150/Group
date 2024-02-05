import { WsException } from "../exception/ws-exception.exception";
import { GroupState } from "../interface/group-state.interface";
import { UpdateGroupPosition } from "../interface/update-group-position.interface";

export function updateGroupState(
    groupState: GroupState,
    updatePosition: UpdateGroupPosition,
    people: number,
): GroupState {
    let totalUser = 0;

    // 역할 상태 변경
    for (let pos of Object.keys(updatePosition)) {
        if (groupState[pos].isActive !== updatePosition[pos]) {
            if (groupState[pos].userId) {
                throw new WsException("현재 변경할 수 없는 상태입니다.");
            }

            groupState[pos].isActive = updatePosition[pos];
        }

        if (updatePosition[pos]) totalUser++;
    }

    totalUser = !totalUser && people ? people : totalUser;

    // 유저수 변동
    if (totalUser < groupState.currentUser) {
        throw new WsException("총 유저수가 현재 유저수보다 커야 합니다.");
    }
    groupState.totalUser = totalUser;

    return groupState;
}
