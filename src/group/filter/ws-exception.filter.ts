import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { WsException } from "../exception/ws-exception.exception";
import { Socket } from "socket.io";

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
    catch(exception: WsException, host: ArgumentsHost) {
        const ctx = host.switchToWs();
        const client = ctx.getClient<Socket>();
        client.emit("error", { message: exception.message });
    }
}
