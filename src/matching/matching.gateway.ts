import { Injectable, UseFilters } from "@nestjs/common";
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
import { StartMatchingDto } from "./dto/start-match.dto";
import { MatchingService } from "./matching.service";
import { MATCH_POSITION } from "./constants/match-tier.constants";
import { MatchedUser } from "./interface/matched-user.dto";

@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: "/matching", cors: "true" })
@Injectable()
export class MatchingGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;

    constructor(
        private readonly groupGateway: GroupGateway,
        private readonly matchingService: MatchingService,
    ) {}

    async handleConnection(client: Socket) {
        console.log(`[Matching]client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        console.log(`[Matching]client disconnected: ${client.id}`);
    }

    @SubscribeMessage("startMatching")
    async startMatching(client: Socket, startMatchingDto: StartMatchingDto) {
        const matchingResult = await this.matchingService.startMatching(
            client.id,
            startMatchingDto,
        );

        // 매칭 결과가 null이면 즉시 종료
        if (!matchingResult) return;

        const { mode, tier, matchedPosition, matchedGroup } = matchingResult;

        const owner = matchedGroup.shift();
        const ownerSocket = await this.groupGateway.findGroupSocketById(
            owner.groupClientId,
        );

        const groupId = await this.groupGateway.groupCreate(ownerSocket, {
            name: "매칭된 그룹",
            mode,
            tier: MATCH_POSITION[tier],
            mic: false,
            owner: 0,
            position: matchedPosition,
        });

        // 나머지 인원 그룹 참가
        this.memberGroupJoin(groupId, matchedGroup);
    }

    // 나미지 인원 그룹 참가 함수
    private async memberGroupJoin(
        groupId: string,
        matchedGroup: MatchedUser[],
    ) {
        const promises = matchedGroup.map((matchedUser) => {
            return this.groupGateway.findGroupSocketById(
                matchedUser.groupClientId,
            );
        });

        const memberSockets = await Promise.all(promises);

        for (let memberSocket of memberSockets) {
            this.groupGateway.groupJoin(memberSocket, { groupId });
        }
    }
}
