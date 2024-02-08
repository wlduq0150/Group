import {
    BadRequestException,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Query,
    Redirect,
    Res,
    Session,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SessionData } from "./interfaces/discord.interface";

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
    getDiscordAuth(): { url: string } {
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
            throw new BadRequestException("코드가 제공되지 않았습니다.");
        }
        try {
            const sessionData: SessionData =
                await this.authService.handleDiscordCallback(code);

            session.discordUserId = sessionData.discordUserId;
            session.userId = sessionData.userId;
            session.accessToken = sessionData.accessToken;

            res.redirect("/html/index.html");
        } catch (err) {
            console.error("인증 실패", err);
            if (err instanceof HttpException) {
                const banUntil = err.message.split(" ")[4];
                res.redirect(
                    `/html/index.html?login=fail&banUntil=${banUntil}`,
                );
            } else {
                res.redirect("/html/index.html?login=fail");
            }
        }
    }

    @Get("/logout")
    @ApiOperation({ summary: "로그아웃" })
    @ApiResponse({ status: 200, description: "로그아웃 성공" })
    logout(@Session() session: Record<string, any>, @Res() res: Response) {
        session.destroy((err) => {
            if (err) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(
                    "로그아웃 실패",
                );
            } else {
                res.redirect("/html/index.html?logout=success");
            }
        });
    }

    @Get("/session")
    @ApiOperation({ summary: "세션 데이터 반환" })
    @ApiResponse({
        status: 200,
        description: "세션 데이터 반환 성공",
    })
    getSessiondata(@Session() session: Record<string, any>) {
        return {
            discordUserId: session.discordUserId,
            userId: session.userId,
            accessToken: session.accessToken,
        };
    }
}
