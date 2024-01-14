import { Server, Socket } from "socket.io";

export class WsException extends Error {
    constructor(message: string) {
        super(message);
        // socket.to(client.id).emit("error", { message });
    }
}
