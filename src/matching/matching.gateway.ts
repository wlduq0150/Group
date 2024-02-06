import { Inject, Injectable, UseFilters, forwardRef } from "@nestjs/common";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsExceptionFilter } from "src/group/filter/ws-exception.filter";
import { GroupGateway } from "src/group/group.gateway";
import { GroupService } from "src/group/group.service";

@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: "/matching", cors: "true" })
@Injectable()
export class MatchingGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;

    constructor(private readonly groupGateway: GroupGateway) {}

    async handleConnection(client: Socket) {
        const groupClientId = client.handshake.query.groupClientId as string;
        const groupSocket =
            await this.groupGateway.findGroupSocketById(groupClientId);
        console.log("그룹 소켓 아이디: ", groupClientId);
        console.log("그룹 소켓: ", groupSocket);
    }

    async handleDisconnect(client: Socket) {
        console.log(`[Matching]client disconnected: ${client.id}`);
    }
}
