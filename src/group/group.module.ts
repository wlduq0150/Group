import { Module } from "@nestjs/common";
import { GroupService } from "./group.service";
import { GroupGateway } from "src/group/group.gateway";
import { RedisModule } from "src/redis/redis.module";
import { UserModule } from "src/user/user.module";
import { DiscordModule } from "src/discord/discord.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GroupRecord } from "../entity/group-record.entity";

@Module({
    imports: [RedisModule, UserModule, DiscordModule, TypeOrmModule.forFeature([GroupRecord])],
    exports: [GroupService],
    providers: [GroupService, GroupGateway]
})
export class GroupModule {
}
