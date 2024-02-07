import { RemoteSocket, Socket } from "socket.io";
import {
    DecorateAcknowledgementsWithMultipleResponses,
    DefaultEventsMap,
} from "socket.io/dist/typed-events";

export function checkIsUserAlreadyJoin(
    client:
        | Socket
        | RemoteSocket<
              DecorateAcknowledgementsWithMultipleResponses<DefaultEventsMap>,
              any
          >,
): boolean {
    let isJoin = false;

    client.rooms.forEach((room) => {
        if (room.includes("group")) {
            isJoin = true;
        }
    });

    return isJoin;
}
