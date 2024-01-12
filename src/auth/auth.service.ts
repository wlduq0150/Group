import {
    HttpException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
    DiscordAuthResponse,
    DiscordConfig,
    DiscordUser,
    GuildMember,
} from "./interfaces/discord.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;
    private readonly scope: string;
    private readonly guildId: string;
    private readonly botToken: string;

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        const discordConfig: DiscordConfig = this.configService.get("discord");

        this.clientId = discordConfig.clientId;
        this.clientSecret = discordConfig.clientSecret;
        this.redirectUri = discordConfig.redirectUri;
        this.scope = discordConfig.scope;
        this.guildId = discordConfig.guildId;
        this.botToken = discordConfig.botToken;
    }

    getDiscordAuthURL(): string {
        const redirectUriEncoded: string = encodeURIComponent(this.redirectUri);

        return `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${redirectUriEncoded}&response_type=code&scope=${this.scope}`;
    }

    async getAccessToken(code: string): Promise<DiscordAuthResponse> {
        const params = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: "authorization_code",
            code,
            redirect_uri: this.redirectUri,
            scope: this.scope,
        });

        try {
            const response = await fetch(
                "https://discord.com/api/oauth2/token",
                {
                    method: "POST",
                    body: params,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                },
            );

            if (!response.ok) {
                throw new UnauthorizedException("인증에 실패했습니다.");
            }

            return response.json();
        } catch (err) {
            throw new InternalServerErrorException(
                "서버 내부 오류가 발생했습니다.",
            );
        }
    }

    async getDiscordUser(accessToken: string): Promise<DiscordUser> {
        const response = await fetch("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new UnauthorizedException("인증에 실패했습니다.");
        }

        return response.json();
    }

    async addUserToGuild(
        accessToken: string,
        userId: string,
    ): Promise<GuildMember> {
        const response = await fetch(
            `https://discord.com/api/guilds/${this.guildId}/members/${userId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bot ${this.botToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token: accessToken,
                }),
            },
        );

        if (!response.ok) {
            const errorCode = response.status;
            const errorText = await response.text();

            throw new HttpException(
                `사용자를 채널에 추가하는데 실패했습니다.: ${errorText}`,
                errorCode,
            );
        }

        return response.json();
    }

    async isUserInGuild(userId: string): Promise<Boolean> {
        try {
            const response = await fetch(
                `https://discord.com/api/guilds/${this.guildId}/members/${userId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bot ${this.botToken}`,
                    },
                },
            );

            if (!response.ok && response.status === 404) {
                return false;
            }

            return response.ok;
        } catch (err) {
            throw new Error(
                "사용자가 채널에 속해있는지 확인하는데 실패했습니다.",
            );
        }
    }

    async saveDiscordUser(discordUser: DiscordUser): Promise<User> {
        let user = await this.userRepository.findOneBy({
            discordId: discordUser.id,
        });

        if (!user) {
            user = this.userRepository.create({
                discordId: discordUser.id,
                username: discordUser.username,
                avatar: discordUser.avatar,
            });
        }

        return this.userRepository.save(user);
    }
}
