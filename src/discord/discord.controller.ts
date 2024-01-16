import {
    Controller,
    NotFoundException,
    Post,
    Req,
    Session,
} from "@nestjs/common";
import { DiscordService } from "./discord.service";
import { ConfigService } from "@nestjs/config";

@Controller("discord")
export class DiscordController {
    constructor(
        private readonly discordService: DiscordService,
        private readonly configService: ConfigService,
    ) {}

    @Post("/join-voice")
    async joinVoice(@Session() session) {
        const userId = session.discordUserId;
        const guildId = this.configService.get<string>("DISCORD_GUILD_ID");

        const channelId = await this.discordService.joinVoiceChannel(
            userId,
            guildId,
        );

        return { channelId };
    }
}
