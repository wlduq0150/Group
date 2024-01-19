import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    UseInterceptors,
} from "@nestjs/common";

import { LolhDto } from "./dto/lol.dto";
import { LolService } from "./lol.service";
import { LolUserIdDto } from "./dto/lol-userId.dto";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { number } from "joi";

// @UseInterceptors(CacheInterceptor)
@Controller("lol")
export class LolController {
    constructor(private readonly lolService: LolService) {}

    @Post()
    async findUser(@Body() lolDto: LolhDto) {
        return await this.lolService.saveUserAllInfo(lolDto.name, lolDto.tag);
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
