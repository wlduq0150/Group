import { Module } from "@nestjs/common";
import { MatchingController } from "./matching.controller";
import { MatchingService } from "./matching.service";
import { MatchingGateway } from "./matching.gateway";
import { GroupModule } from "src/group/group.module";
import { RedisModule } from "src/redis/redis.module";

@Module({
    imports: [GroupModule, RedisModule],
    controllers: [MatchingController],
    providers: [MatchingService, MatchingGateway],
})
export class MatchingModule {}
