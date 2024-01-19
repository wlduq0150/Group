import { Body, Controller, Get, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { accessTokenGuard } from "src/auth/guard/access-token.guard";
import { UserId } from "src/auth/decorators/userId.decorator";
import { ApiBearerAuth } from "@nestjs/swagger";
import { GetUserDto } from "./dto/get-user.dto";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @ApiBearerAuth("accessToken")
    @UseGuards(accessTokenGuard)
    @Get("All")
    findAll() {
        return this.userService.findAll();
    }

    @ApiBearerAuth("accessToken")
    @UseGuards(accessTokenGuard)
    @Get("me")
    findUserById(@UserId() id: string) {
        return this.userService.findUserById(+id);
    }

    @Get("")
    findUserByName(@Body() getData: GetUserDto) {
        return this.userService.findUserByName(getData);
    }
}
