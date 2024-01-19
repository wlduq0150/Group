import { GroupState } from "../interface/group-state.interface";

export function initGroupState(position: string[]): GroupState {
    const groupState: GroupState = {
        totalUser: position.length,
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

    return groupState;
}
