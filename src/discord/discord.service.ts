import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { ChannelType, Client, VoiceChannel } from "discord.js";
import { ConfigService } from "@nestjs/config";
import { GroupService } from "src/group/group.service";
import { UserService } from "src/user/user.service";

@Injectable()
export class DiscordService implements OnModuleInit {
    private readonly client: Client<boolean> = new Client({
        intents: ["Guilds", "GuildVoiceStates", "GuildMembers"],
    });

    constructor(
        private readonly configService: ConfigService,
        private readonly groupService: GroupService,
        private readonly userService: UserService,
    ) {}

    async onModuleInit(): Promise<void> {
        const botToken: string =
            this.configService.get<string>("DISCORD_BOT_TOKEN");
        await this.client.login(botToken);

        this.client.on("voiceStateUpdate", async (oldState, newState) => {
            if (oldState.channelId && !newState.channelId) {
                const channel = oldState.channel;
                if (channel && channel.members.size === 0) {
                    try {
                        await channel.delete();
                    } catch (error) {
                        console.error("음성 채널 삭제 실패:", error);
                    }
                }
            }
        });
    }

    // 디스코드 음성 채널 생성 및 역할 연결
    async createVoiceChannelAndRole(guildId: string, discordId: string) {
        const guild = this.client.guilds.cache.get(guildId);

        if (!guild) {
            throw new NotFoundException("해당 서버를 찾을 수 없습니다.");
        }

        const user = await this.userService.findOneByDiscordId(discordId);

        const groupId: string = await this.groupService.findGroupIdByOwner(
            user.id,
        );
        const group = await this.groupService.findGroupInfoById(groupId);
        const channelName: string = group.name;

        // 역할 생성
        const role = await guild.roles.create({
            name: `${channelName}-access`,
            permissions: [],
        });

        // 음성 채널 생성
        const voiceChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: ["ViewChannel"],
                },
                {
                    id: role.id,
                    allow: ["ViewChannel", "Connect", "Speak"],
                },
            ],
        });

        return { voiceChannel, role };
    }

    // 디스코드 음성 채널에 유저 추가
    async assignRoleAndMoveToChannel(
        discordId: string,
        guildId: string,
        roleId: string,
        channelId: string,
    ): Promise<void> {
        const guild = this.client.guilds.cache.get(guildId);
        const member = await guild.members.fetch(discordId);
        const channel = guild.channels.cache.get(channelId) as VoiceChannel;

        if (!member || !channel) {
            throw new NotFoundException(
                "해당 유저 또는 채널을 찾을 수 없습니다.",
            );
        }

        await member.roles.add(roleId);
        await member.voice.setChannel(channel);
    }

    async setupUserVoiceChannel(
        guildId: string,
        discordId: string,
    ): Promise<void> {
        const { voiceChannel, role } = await this.createVoiceChannelAndRole(
            guildId,
            discordId,
        );

        const voiceChannelId: string = voiceChannel.id;
        const roleId: string = role.id;

        await this.assignRoleAndMoveToChannel(
            discordId,
            guildId,
            roleId,
            voiceChannelId,
        );
    }
}
