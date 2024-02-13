import { Inject, Injectable, OnModuleInit, forwardRef } from "@nestjs/common";
import {
    Channel,
    Client,
    GuildChannel,
    GuildMember,
    Role,
    VoiceChannel,
} from "discord.js";
import { ConfigService } from "@nestjs/config";
import { GroupService } from "src/group/group.service";
import { UserService } from "./../user/user.service";

@Injectable()
export class DiscordServiceRefac implements OnModuleInit {
    private readonly client: Client<boolean> = new Client({
        intents: ["Guilds", "GuildVoiceStates", "GuildMembers"],
    });

    private readonly LOBBY_CHANNEL_ID: string;
    private readonly GAME_ROOM_CATEGORY_ID: string;

    constructor(
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => GroupService))
        private readonly groupService: GroupService,
        private readonly userService: UserService,
    ) {
        this.LOBBY_CHANNEL_ID = this.configService.get<string>(
            "DISCORD_LOBBY_CHANNEL_ID",
        );
        this.GAME_ROOM_CATEGORY_ID =
            this.configService.get<string>("DISCORD_PARENT_ID");
    }

    async onModuleInit(): Promise<void> {
        this.client.on("voiceStateUpdate", async (oldState, newState) => {
            const oldChannelId = oldState.channelId;
            const newChannelId = newState.channelId;

            if (oldChannelId !== newChannelId) {
                const oldChannel = oldState.guild.channels.resolve(
                    oldChannelId,
                ) as VoiceChannel;

                if (this.shouldDeleteChannel(oldChannel)) {
                    const oldRole = oldState.guild.roles.cache.find(
                        (role) => role.name === `${oldChannel.name}-access`,
                    );
                    if (oldRole) {
                        await this.deleteRole(oldState.guild.id, oldRole.id);
                    }
                    await this.deleteChannel(oldChannel);
                }
            }
        });

        await this.client.login(
            this.configService.get<string>("DISCORD_BOT_TOKEN"),
        );
    }

    private shouldDeleteChannel(channel: VoiceChannel): boolean {
        return channel && channel.members.size === 0;
    }

    async moveGroupMembersToNewChannel(guildId: string, discordId: string) {
        // ...생략...
    }

    async deleteOldChannelAndRole(guildId: string, discordId: string) {
        // ...생략...
    }

    private async getGroupMembers(discordId: string) {
        // ...생략...
    }

    private async getGuildMember(guildId: string, discordId: string) {
        // ...생략...
    }

    private isMemberInLobby(member: GuildMember) {
        // ...생략...
    }

    private async assignRoleAndMoveMember(
        role: Role,
        channel: VoiceChannel,
        member: GuildMember,
    ) {
        // ...생략...
    }

    private async getVoiceChannelByDiscordId(
        guildId: string,
        discordId: string,
    ) {
        // ...생략...
    }

    private async getRoleByDiscordId(guildId: string, discordId: string) {
        // ...생략...
    }

    private async createVoiceChannelAndRole(
        guildId: string,
        discordId: string,
    ) {
        // ...생략...
    }

    private async deleteChannel(channel: GuildChannel): Promise<void> {
        // ...생략...
    }

    private async deleteRole(guildId: string, roleId: string): Promise<void> {
        // ...생략...
    }
}
