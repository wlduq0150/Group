import { GroupState } from "../interface/group-state.interface";
import { Position } from "../type/position.type";

export function initGroupState(
    position: Position[],
    people?: number,
): GroupState {
    const groupState: GroupState = {
        totalUser: position.length ? position.length : people,
        currentUser: 0,
        mid: { isActive: false, userId: null },
        adc: { isActive: false, userId: null },
        sup: { isActive: false, userId: null },
        top: { isActive: false, userId: null },
        jg: { isActive: false, userId: null },
    };

    position.map((pos) => {
        if (pos in groupState) {
            groupState[pos].isActive = true;
        }
    });

    console.log(groupState);

    return groupState;
}
