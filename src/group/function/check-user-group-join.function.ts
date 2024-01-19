import { Socket } from "socket.io";

export function checkIsUserAlreadyGroupJoin(
    client: Socket,
    groupId: string,
): boolean {
    if (client.rooms.has(groupId)) {
        return true;
    }

    return false;
}
