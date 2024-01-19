import { POSITION_LIST } from "../constants/position.constants";
import { GroupState } from "../interface/group-state.interface";
import { Position } from "../type/position.type";

export function checkIsUserPositionSelect(
    groupState: GroupState,
    userId: number,
): Position {
    let select: Position = "none";

    POSITION_LIST.map((pos) => {
        const position: {
            isActive: boolean;
            userId: number | null;
        } = groupState[pos];

        if (position.isActive && position.userId === userId) {
            select = pos;
        }
    });

    return select;
}
