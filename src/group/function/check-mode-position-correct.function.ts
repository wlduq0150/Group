import { WsException } from "../exception/ws-exception.exception";
import { UpdateGroupPosition } from "../interface/update-group-position.interface";

export function checkPositionCorrectForMode(
    mode: string,
    position: UpdateGroupPosition,
) {
    let positionCount = 0;
    Object.keys(position).forEach((pos) => {
        if (position[pos]) positionCount++;
    });

    if (mode === "aram" && positionCount > 0) {
        throw new WsException(
            "칼바람나락 모드에서는 포지션을 선택할 수 없습니다.",
        );
    }

    if (mode !== "aram" && positionCount < 2) {
        throw new WsException("두가지 이상의 포지션을 선택하셔야 합니다.");
    }
}
