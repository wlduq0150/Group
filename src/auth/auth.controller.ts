import { Controller, Get, Query, Redirect, Res, Session } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
    DiscordAuthResponse,
    DiscordUser,
} from "./interfaces/discord.interface";
import { User } from "src/entity/user.entity";

@ApiTags("사용자 인증")
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get("/login")
    @Redirect()
    @ApiOperation({ summary: "디스코드 인증 페이지로 리다이렉트" })
    @ApiResponse({
        status: 302,
        description: "디스코드 인증 페이지로 리다이렉트됩니다.",
    })
    getDiscordAuth() {
        const redirectUrl: string = this.authService.getDiscordAuthURL();

        return { url: redirectUrl };
    }

    @Get("/discord/callback")
    @ApiOperation({ summary: "디스코드 OAuth2 콜백 처리" })
    @ApiQuery({
        name: "code",
        required: true,
        description: "디스코드 인증 후 반환되는 코드",
    })
    @ApiResponse({
        status: 200,
        description: "인증 성공, 세션에 액세스 토큰 저장",
    })
    async discordCallback(
        @Query("code") code: string,
        @Session() session: Record<string, any>,
        @Res() res: Response,
    ): Promise<void> {
        if (!code) {
            res.redirect("/login?error=NoCodeProvided");
            return;
        }

        try {
            const accessTokenResponse: DiscordAuthResponse =
                await this.authService.getAccessToken(code);
            const accessToken: string = accessTokenResponse.access_token;

            const user: DiscordUser =
                await this.authService.getDiscordUser(accessToken);

            const isMember: Boolean = await this.authService.isUserInGuild(
                user.id,
            );

            if (!isMember) {
                await this.authService.addUserToGuild(user.id, accessToken);
            }

            const saveUser: User = await this.authService.saveDiscordUser(user);

            session.discordUserId = saveUser.discordId;
            session.accessToken = accessToken;

            res.redirect("http://localhost:5500/public/auth-test.html");
        } catch (err) {
            console.error("인증 실패", err);
            res.redirect("http://localhost:5500/public/auth-test.html");
        }
    }

    @Get("/session")
    getSessiondata(@Session() session: Record<string, any>) {
        return {
            discordUserId: session.discordUserId,
            accessToken: session.accessToken,
        };
    }
}
