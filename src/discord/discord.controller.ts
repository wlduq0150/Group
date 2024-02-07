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

        this.logger.log("111Joining voice channel...", DiscordController.name);
        this.logger.debug("222Joining voice channel...");
        this.logger.verbose(
            "333Joining voice channel...",
            DiscordController.name,
        );
        this.logger.warn("444Joining voice channel...");

        await this.discordService.setupUserVoiceChannel(guildId, discordId);

        return {
            statusCode: HttpStatus.OK,
            message: "음성 채널에 입장했습니다.",
        };
    }
}
