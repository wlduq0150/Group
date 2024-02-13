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
        voiceChannelRole: string;
        voiceChannelId: string;
    }> {
        console.log(guildId);
        const guild = this.client.guilds.cache.get(guildId);
        console.log(guild);

        if (!guild) {
            throw new NotFoundException("해당 서버를 찾을 수 없습니다.");
        }

        const user = await this.userService.findOneByDiscordId(discordId);

        // 역할 생성
        const role = await guild.roles.create({
            name: `${user.username}-access`,
            permissions: [],
        });

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
                {
                    id: role.id,
                    allow: ["ViewChannel", "Connect", "Speak"],
                },
            ],
        });

        return {
            voiceChannel: voiceChannel,
            voiceChannelRole: role.id,
            voiceChannelId: voiceChannel.id,
        };
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
            throw new NotFoundException("해당 채널을 찾을 수 없습니다.");
        }

        await Promise.all(
            discordIds.map(async (discordId) => {
                const member: GuildMember =
                    await guild.members.fetch(discordId);
                if (member && member.voice.channel) {
                    try {
                        await member.roles.add(roleId);
                        await member.voice.setChannel(channel);
                    } catch (err) {
                        console.error(`유저 이동 중 오류 발생: ${err}`);
                    }
                }
            }),
        );
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

        const discordIds: string[] = await Promise.all(
            userIds.map((userId) =>
                this.userService.findDiscordIdByUserId(userId),
            ),
        );

        const voiceChannelId: string = groupInfo.voiceChannelId;
        const roleId: string = groupInfo.voiceChannelRole;

        await this.assignRoleAndMoveToChannel(
            discordIds,
            guildId,
            roleId,
            voiceChannelId,
        );
    }

    // 채널 삭제
    async deleteChannel(channelId: string, discordId: string): Promise<void> {
        try {
            const channel = this.client.channels.cache.get(
                channelId,
            ) as GuildChannel;
            if (!channel) {
                throw new NotFoundException("해당 채널을 찾을 수 없습니다.");
            }

            const guild = this.client.guilds.cache.get(channel.guild.id);
            const user = await this.userService.findOneByDiscordId(discordId);
            const role = guild.roles.cache.find(
                (role) => role.name === `${user.username}-access`,
            );

            if (role) {
                await this.deleteRole(guild.id, role.id);
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

    // 역할 삭제
    private async deleteRole(guildId: string, roleId: string): Promise<void> {
        const guild = this.client.guilds.cache.get(guildId);
        const role = guild.roles.cache.get(roleId);

        if (!role) {
            throw new NotFoundException("해당 역할을 찾을 수 없습니다.");
        }

        try {
            await role.delete();
        } catch (error) {
            console.error(`역할 삭제 실패: ${error}`);
        }
    }
}
