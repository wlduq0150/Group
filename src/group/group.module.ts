import { Module, forwardRef } from "@nestjs/common";
import { GroupService } from "./group.service";
import { GroupGateway } from "src/group/group.gateway";
import { RedisModule } from "src/redis/redis.module";
import { UserModule } from "src/user/user.module";
import { DiscordModule } from "src/discord/discord.module";

@Module({
    imports: [RedisModule, UserModule, DiscordModule],
    exports: [GroupService, GroupGateway],
    providers: [GroupService, GroupGateway],
})
export class GroupModule {}
