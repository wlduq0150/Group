import { Position } from "src/group/type/position.type";

export function getDataFromMatchingKey(key: string) {
    const keyAttrs = key.replace("matching:user:", "").split(":");

    return {
        matchingClientId: keyAttrs[0],
        mode: keyAttrs[1],
        people: keyAttrs[2],
        tier: keyAttrs[3],
        position: keyAttrs[4] as Position,
    };
}
