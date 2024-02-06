import { Inject, Injectable, OnModuleInit, forwardRef } from "@nestjs/common";
import { Channel, Client, GuildChannel } from "discord.js";
import { ConfigService } from "@nestjs/config";
import { GroupService } from "src/group/group.service";
import { UserService } from "./../user/user.service";

@Injectable()
export class DiscordServiceRefac implements OnModuleInit {
    private readonly client: Client<boolean> = new Client({
        intents: ["Guilds", "GuildVoiceStates", "GuildMembers"],
    });
    private groupChannelMap = new Map<string, string>();
    private creatingChannels = new Map<string, boolean>();

    constructor(
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => GroupService))
        private readonly groupService: GroupService,
        private readonly userService: UserService,
    ) {}

    async onModuleInit() {
        await this.loginToDiscord();
        this.setupVoiceStateUpdateListener();
    }

    private async loginToDiscord() {
        const botToken = this.configService.get<string>("DISCORD_BOT_TOKEN");
        await this.client.login(botToken);
    }

    private setupVoiceStateUpdateListener() {
        const lobbyChannelId = this.configService.get<string>(
            "DISCORD_LOBBY_CHANNEL_ID",
        );

        this.client.on("voiceStateUpdate", async (oldState, newState) => {
            const channel = oldState.channel;
            const discordId = newState.member.id;

            if (
                this.isNotLobbyChannel(oldState, lobbyChannelId, newState) &&
                this.shouldDeleteChannel(channel)
            ) {
                await this.deleteVoiceChannelForGroup(channel.id, discordId);
            }
        });
    }

    private isNotLobbyChannel(oldState, lobbyChannelId, newState) {
        return (
            oldState.channelId !== lobbyChannelId &&
            (!newState.channelId || newState.channelId !== lobbyChannelId)
        );
    }

    private shouldDeleteChannel(channel: Channel | undefined): boolean {
        return (
            this.isGuildChannel(channel) &&
            channel.members &&
            !channel.members.size
        );
    }

    private isGuildChannel(channel: unknown): channel is GuildChannel {
        return (channel as GuildChannel)?.type !== undefined;
    }

    async deleteVoiceChannelForGroup(
        groupId: string,
        discordId: string,
    ): Promise<void> {
        const channelId = this.groupChannelMap.get(groupId);
        if (!channelId) return;

        try {
            const channel = this.client.channels.cache.get(channelId);
            if (channel && this.isGuildChannel(channel)) {
                await this.deleteChannelAndRole(channel, discordId);
                this.groupChannelMap.delete(groupId);
            }
        } catch (error) {
            console.error(`채널 삭제 중 오류 발생: ${channelId}`, error);
        }
    }

    private async deleteChannelAndRole(
        channel: GuildChannel,
        discordId: string,
    ): Promise<void> {
        try {
            const guild = this.client.guilds.cache.get(channel.guild.id);
            const user = await this.userService.findOneByDiscordId(discordId);
            const role = guild.roles.cache.find(
                (role) => role.name === `${user.username}-access`,
            );
            if (role) {
                await role.delete();
            }
            await channel.delete();
        } catch (error) {
            console.error(
                `채널 및 역할 삭제 중 오류 발생: ${channel.id}`,
                error,
            );
        }
    }
}
