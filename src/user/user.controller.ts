<<<<<<< HEAD
import { Controller } from "@nestjs/common";
=======
import { Controller, Get, Session } from "@nestjs/common";
>>>>>>> 5ea7f2926348a88da7c38d0bf03ebcf8901c5050
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}
<<<<<<< HEAD
=======

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
>>>>>>> 5ea7f2926348a88da7c38d0bf03ebcf8901c5050
}
