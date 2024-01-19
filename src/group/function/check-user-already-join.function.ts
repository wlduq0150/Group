import { Socket } from "socket.io";

export function checkIsUserAlreadyJoin(client: Socket): boolean {
    let isJoin = false;

    client.rooms.forEach((room) => {
        if (room.includes("group")) {
            isJoin = true;
        }
    });

    return isJoin;
}
