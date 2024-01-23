export interface DiscordConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string;
    guildId: string;
    botToken: string;
}

export interface DiscordAuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    locale?: string;
    verified?: boolean;
    email?: string;
    flags?: number;
    premium_type?: number;
    public_flags?: number;
}

export interface GuildMember {
    user: {
        id: string;
        username: string;
        discriminator: string;
        avatar: string;
        bot?: boolean;
        system?: boolean;
        mfa_enabled?: boolean;
        locale?: string;
        verified?: boolean;
        email?: string;
        flags?: number;
        premium_type?: number;
        public_flags?: number;
    };
    nick?: string;
    roles: string[];
    joined_at: string;
    premium_since?: string;
    deaf: boolean;
    mute: boolean;
    pending?: boolean;
    permissions?: string;
}

export interface SessionData {
    discordUserId: string;
    accessToken: string;
}
