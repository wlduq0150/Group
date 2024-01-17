import { Module } from "@nestjs/common";
import { DiscordService } from "./discord.service";
import { DiscordController } from "./discord.controller";
import { GroupModule } from "src/group/group.module";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [GroupModule, UserModule],
    controllers: [DiscordController],
    providers: [DiscordService],
})
export class DiscordModule {}
