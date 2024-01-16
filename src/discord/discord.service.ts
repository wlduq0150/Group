import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { ChannelType, Client, VoiceChannel } from "discord.js";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DiscordService implements OnModuleInit {
    private readonly client: Client<boolean> = new Client({
        intents: ["Guilds", "GuildVoiceStates", "GuildMembers"],
    });

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit(): Promise<void> {
        const botToken = this.configService.get<string>("DISCORD_BOT_TOKEN");
        await this.client.login(botToken);
    }

    // 빈 음성 채널 찾기
    async findEmptyVoiceChannel(guildId: string): Promise<string | null> {
        const guild = this.client.guilds.cache.get(guildId);

        if (!guild)
            throw new NotFoundException("해당 서버를 찾을 수 없습니다.");

        const emptyVoiceChannel = guild.channels.cache.find(
            (channel) =>
                (channel.type === ChannelType.GuildVoice ||
                    channel.type === ChannelType.GuildStageVoice) &&
                guild.voiceStates.cache.filter(
                    (vs) => vs.channelId === channel.id,
                ).size === 0,
        ) as VoiceChannel;

        return emptyVoiceChannel?.id || null;
    }

    // 빈 음성 채널 입장 시키기
    async joinVoiceChannel(userId: string, guildId: string): Promise<string> {
        const guild = this.client.guilds.cache.get(guildId);

        const member = await guild.members.fetch(userId);

        if (!member) {
            throw new NotFoundException("해당 유저를 찾을 수 없습니다.");
        }

        const emptyVoiceChannelId = await this.findEmptyVoiceChannel(guildId);

        if (!emptyVoiceChannelId) {
            throw new NotFoundException("빈 음성 채널이 없습니다.");
        }

        const voiceChannel = guild.channels.cache.get(
            emptyVoiceChannelId,
        ) as VoiceChannel;

        if (!voiceChannel) {
            throw new NotFoundException("음성 채널을 찾을 수 없습니다.");
        }

        await member.voice.setChannel(voiceChannel);

        return voiceChannel.id;
    }
}
