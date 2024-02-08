import {
    Controller,
    HttpStatus,
    Inject,
    Logger,
    LoggerService,
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
        @Inject(Logger) private readonly logger: LoggerService,
    ) {}

    @Post("/join-voice")
    async joinVoice(@Session() session) {
        const guildId = this.configService.get<string>("DISCORD_GUILD_ID");
        const discordId = session.discordUserId;

        await this.discordService.setupUserVoiceChannel(guildId, discordId);

        return {
            statusCode: HttpStatus.OK,
            message: "음성 채널에 입장했습니다.",
        };
    }
}
