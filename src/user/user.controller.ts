import { Controller, Get, Session } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

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
