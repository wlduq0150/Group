import { Module } from "@nestjs/common";
import { MatchingController } from "./matching.controller";
import { MatchingService } from "./matching.service";
import { MatchingGateway } from "./matching.gateway";
import { GroupModule } from "src/group/group.module";

@Module({
    imports: [GroupModule],
    controllers: [MatchingController],
    providers: [MatchingService, MatchingGateway],
})
export class MatchingModule {}
