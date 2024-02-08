import { Controller, Get, Param, Session } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @Get("/:id")
    async findUserName(@Param("id") userId: number) {
        const userName = await this.userService.findNameByUserId(+userId);
        return userName;
    }

    @Get("/detail/:id")
    async findUserDetail(@Param("id") userId: number) {
        const user = await this.userService.findOneById(+userId);
        return user;
    }

    @Get("/checkLogin")
    async checkLogin(@Session() session: any) {
        const discordId = session.discordUserId;
        if (!discordId) {
            return null;
        }
        const user = await this.userService.findOneByDiscordId(discordId);
        if (!user) {
            return null;
        }
        return user.id;
    }
}
