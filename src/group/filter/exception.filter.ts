import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { WsException } from "../exception/ws-exception.exception";
import { Socket } from "socket.io";

@Catch(Error)
export class WsBaseExceptionFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        console.log("예상치 못한 에러: ", exception);
    }
}
