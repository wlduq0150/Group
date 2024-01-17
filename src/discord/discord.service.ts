import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import {
    ChannelType,
    Client,
    VoiceBasedChannel,
    VoiceChannel,
} from "discord.js";
import { ConfigService } from "@nestjs/config";
import { GroupService } from "src/group/group.service";
import { UserService } from "src/user/user.service";

@Injectable()
export class DiscordService implements OnModuleInit {
    private readonly client: Client<boolean> = new Client({
        intents: ["Guilds", "GuildVoiceStates", "GuildMembers"],
    });
    private groupChannelMap = new Map<string, string>();

    constructor(
        private readonly configService: ConfigService,
        private readonly groupService: GroupService,
        private readonly userService: UserService,
    ) {}

    async onModuleInit(): Promise<void> {
        const botToken = this.configService.get<string>("DISCORD_BOT_TOKEN");
        await this.client.login(botToken);

        const lobbyChannelId = this.configService.get<string>(
            "DISCORD_LOBBY_CHANNEL_ID",
        );

        this.client.on("voiceStateUpdate", async (oldState, newState) => {
            if (oldState.channelId && !newState.channelId) {
                const channel = oldState.channel;

                if (channel) {
                    const shouldDelete = this.shouldDeleteChannel(
                        channel,
                        lobbyChannelId,
                    );
                    if (shouldDelete) {
                        console.log("채널 삭제 `조건 충족:", channel.id);
                        await this.deleteChannel(channel);
                    }
                }
            }
        });
    }

    // 채널 삭제 조건 검증
    private shouldDeleteChannel(
        channel: VoiceBasedChannel,
        lobbyChannelId: string,
    ): boolean {
        return channel.id !== lobbyChannelId && this.isChannelEmpty(channel);
    }

    // 채널 유저 검증
    private isChannelEmpty(channel: VoiceBasedChannel): boolean {
        return !channel.guild.members.cache.some(
            (member) => member.voice.channelId === channel.id,
        );
    }

    // 채널 삭제
    private async deleteChannel(channel: VoiceBasedChannel): Promise<void> {
        try {
            await channel.delete();
            console.log(`채널 삭제 성공: ${channel.id}`);
        } catch (error) {
            console.error(`채널 삭제 중 오류 발생: ${channel.id}`, error);
        }
    }

    // 그룹 취소 시 음성 채널 삭제
    async deleteVoiceChannelForGroup(groupId: string): Promise<void> {
        const channelId = this.groupChannelMap.get(groupId);

        if (channelId) {
            const channel = this.client.channels.cache.get(channelId);
            if (channel) {
                await this.deleteChannel(channel as VoiceBasedChannel);
            }
            this.groupChannelMap.delete(groupId);
        }
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
        this.groupChannelMap.set(groupId, voiceChannel.id);

        return { voiceChannel, role };
    }

    // 채널 및 역할 추가
    async assignRoleAndMoveToChannel(
        discordIds: string[],
        guildId: string,
        roleId: string,
        channelId: string,
    ): Promise<void> {
        const guild = this.client.guilds.cache.get(guildId);
        const channel = guild.channels.cache.get(channelId) as VoiceChannel;

        if (!channel) {
            throw new NotFoundException(
                "해당 유저 또는 채널을 찾을 수 없습니다.",
            );
        }

        for (const discordId of discordIds) {
            const member = await guild.members.fetch(discordId);

            if (member) {
                await member.roles.add(roleId);
                await member.voice.setChannel(channel);
            }
        }
    }

    // 음성 채널 이동시킬 유저 세팅
    async setupUserVoiceChannel(
        guildId: string,
        discordId: string,
    ): Promise<void> {
        const { voiceChannel, role } = await this.createVoiceChannelAndRole(
            guildId,
            discordId,
        );

        const user = await this.userService.findOneByDiscordId(discordId);

        const groupId: string = await this.groupService.findGroupIdByOwner(
            user.id,
        );

        const groupState = await this.groupService.findGroupStateById(groupId);
        const positions = ["mid", "adc", "sup", "top", "jg"];

        const userIds = positions
            .filter((position) => groupState[position].isActive)
            .map((position) => groupState[position].userId);

        const discordIds = await Promise.all(
            userIds.map((userId) =>
                this.userService.findDiscordIdByUserId(userId),
            ),
        );

        const voiceChannelId: string = voiceChannel.id;
        const roleId: string = role.id;

        await this.assignRoleAndMoveToChannel(
            discordIds,
            guildId,
            roleId,
            voiceChannelId,
        );
    }
}
