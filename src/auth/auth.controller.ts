import { Controller, Get, Query, Redirect, Res, Session } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

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
    @ApiResponse({ status: 401, description: "인증에 실패했습니다." })
    @ApiResponse({ status: 500, description: "서버 내부 오류가 발생했습니다." })
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
    @ApiResponse({ status: 400, description: "잘못된 요청입니다." })
    @ApiResponse({ status: 401, description: "인증에 실패했습니다." })
    @ApiResponse({ status: 500, description: "서버 내부 오류가 발생했습니다." })
    async discordCallback(
        @Query("code") code: string,
        @Session() session: Record<string, any>,
        @Res() res: Response,
    ) {
        if (!code) {
            res.redirect("/login?error=NoCodeProvided");
            return;
        }

        try {
            const accessTokenResponse =
                await this.authService.getAccessToken(code);
            const accessToken = accessTokenResponse.access_token;

            const user = await this.authService.getDiscordUser(accessToken);

            const isMember: Boolean = await this.authService.isUserInGuild(
                user.id,
            );

            if (!isMember) {
                await this.authService.addUserToGuild(user.id, accessToken);
            }

            session.accessToken = accessToken;

            // todo: 개발 완료 후 지울 것
            console.log("session", session);

            res.redirect("/");
        } catch (err) {
            console.log("err", err);
            res.redirect("/login?error=AuthenticationFailed");
        }
    }
}
