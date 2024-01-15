import { Module } from "@nestjs/common";
import { GroupService } from "./group.service";
import { GroupGateway } from "src/group/group.gateway";
import { RedisModule } from "src/redis/redis.module";

@Module({
    imports: [RedisModule],
    exports: [GroupService],
    providers: [GroupService, GroupGateway],
})
export class GroupModule {}
