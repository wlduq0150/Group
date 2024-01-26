import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Session,
    UseInterceptors,
} from "@nestjs/common";

import { LolDto } from "./dto/lol.dto";
import { LolService } from "./lol.service";
import { LolUserIdDto } from "./dto/lol-userId.dto";
import { UserService } from "src/user/user.service";

// @UseInterceptors(CacheInterceptor)
@Controller("lol")
export class LolController {
    constructor(
        private readonly lolService: LolService,
        private readonly userService: UserService,
    ) {}

    //유저 생성
    @Post()
    async findUser(@Body() lolDto: LolDto) {
        return await this.lolService.saveUserAllInfo(
            lolDto.name,
            lolDto.tag,
            lolDto.userId,
        );
    }

    @Post("userNameTag")
    async findUserByNameTag(@Body() lolDto: LolDto, @Session() session) {
        return await this.lolService.findUserByNameTag(
            lolDto.name,
            lolDto.tag,
            session.userId,
        );
    }

    @Get("discordUser/:userId")
    async findUserByUserId(@Param("userId") userId: number) {
        return await this.lolService.findUserByUserId(userId);
    }

    @Get("user/:userId")
    async findUserInfo(@Param("userId") userId: number) {
        return await this.lolService.findUserProfile(userId);
    }

    @Put("")
    async updateUserChampion(@Body() lolUserIdDto: LolUserIdDto) {
        return await this.lolService.updateUserChampion(lolUserIdDto.userId);
    }
}
