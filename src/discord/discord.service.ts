import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit,
} from "@nestjs/common";
import {
    ChannelType,
    Client,
    GuildChannel,
    GuildMember,
    Role,
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

    constructor(
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => GroupService))
        private readonly groupService: GroupService,
        private readonly userService: UserService,
    ) {}

    async onModuleInit(): Promise<void> {
        const botToken = this.configService.get<string>("DISCORD_BOT_TOKEN");
        await this.client.login(botToken);
    }

    // 디스코드 음성 채널 생성 및 역할 연결
    async createVoiceChannelAndRole(
        guildId: string,
        discordId: string,
    ): Promise<{
        voiceChannel: VoiceChannel;
        voiceChannelId: string;
    }> {
        console.log(guildId);
        const guild = this.client.guilds.cache.get(guildId);
        console.log(guild);

        if (!guild) {
            throw new NotFoundException("해당 서버를 찾을 수 없습니다.");
        }

        const user = await this.userService.findOneByDiscordId(discordId);

        // 음성 채널 생성
        const voiceChannel = await guild.channels.create({
            name: user.username,
            type: ChannelType.GuildVoice,
            parent: this.configService.get<string>("DISCORD_PARENT_ID"),
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: ["ViewChannel"],
                },
            ],
        });

        return {
            voiceChannel: voiceChannel,
            voiceChannelId: voiceChannel.id,
        };
    }

    // 채널 및 역할 추가
    async assignRoleAndMoveToChannel(
        discordId: string,
        guildId: string,
        channelId: string,
    ): Promise<void> {
        const guild = this.client.guilds.cache.get(guildId);
        const channel = guild.channels.cache.get(channelId) as VoiceChannel;

        if (!channel) {
            throw new NotFoundException("해당 채널을 찾을 수 없습니다.");
        }

        try {
            const member: GuildMember = await guild.members.fetch(discordId);
            if (member && member.voice.channel) {
                await member.voice.setChannel(channel);
            }
        } catch (err) {
            console.error(`유저 이동 중 오류 발생: ${err}`);
        }
    }

    // 음성 채널 이동시킬 유저 세팅
    async setupUserVoiceChannel(
        guildId: string,
        discordId: string,
    ): Promise<void> {
        const user = await this.userService.findOneByDiscordId(discordId);

        if (!user) {
            throw new NotFoundException("해당 유저를 찾을 수 없습니다.");
        }

        const groupId: string = await this.groupService.findGroupIdByOwner(
            user.id,
        );

        if (!groupId) {
            throw new NotFoundException("해당 그룹을 찾을 수 없습니다.");
        }

        let userIds: number[];

        const groupInfo = await this.groupService.findGroupInfoById(groupId);
        const groupState = await this.groupService.findGroupStateById(groupId);

        if (groupInfo.mode === "aram") {
            userIds = await this.groupService.findGroupUsers(groupId);
        } else {
            const positions: string[] = ["mid", "adc", "sup", "top", "jg"];

            userIds = positions
                .filter(
                    (position) =>
                        groupState[position].isActive &&
                        groupState[position].userId,
                )
                .map((position) => groupState[position].userId);
        }

        const voiceChannelId: string = groupInfo.voiceChannelId;

        await this.assignRoleAndMoveToChannel(
            discordId,
            guildId,
            voiceChannelId,
        );
    }

    // 채널 삭제
    async deleteChannel(channelId: string): Promise<void> {
        try {
            const channel = this.client.channels.cache.get(
                channelId,
            ) as GuildChannel;
            if (!channel) {
                throw new NotFoundException("해당 채널을 찾을 수 없습니다.");
            }

            await channel.delete();
        } catch (error) {
            if (error.code === 10003) {
                console.log("이미 삭제 된 채널.");
                return;
            }

            console.error(`채널 삭제 중 오류 발생: ${channelId}`, error);
        }
    }

    // 대기실로 이동
    async moveUserToLobbyChannel(
        userId: string,
        channelId: string,
    ): Promise<void> {
        try {
            const guildId = this.configService.get<string>("DISCORD_GUILD_ID");
            const guild = this.client.guilds.cache.get(guildId);

            const guildMember = guild.members.cache.get(userId);

            if (!guildMember) {
                throw new Error("해당 사용자를 찾을 수 없습니다.");
            }

            const channel = guild.channels.cache.get(channelId) as VoiceChannel;

            if (!channel || !("join" in channel)) {
                throw new Error("해당 채널을 찾을 수 없습니다.");
            }

            await guildMember.voice.setChannel(channel);
        } catch (error) {
            console.error(
                `채널 이동 중 오류 발생: ${userId} -> ${channelId}`,
                error,
            );
        }
    }
}
