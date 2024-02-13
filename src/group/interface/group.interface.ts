import { Role } from "discord.js";

export interface Group {
    name: string;
    mode: string;
    tier: string;
    mic: boolean;
    owner: number;
    open: boolean;
    voiceChannelId: string;
    voiceChannelRole: string;
}
