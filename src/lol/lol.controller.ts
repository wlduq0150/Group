import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    UseInterceptors,
} from "@nestjs/common";

import { LolhDto } from "./dto/lol.dto";
import { LolService } from "./lol.service";
import { LolUserIdDto } from "./dto/lol-userId.dto";
import { CacheInterceptor } from "@nestjs/cache-manager";

// @UseInterceptors(CacheInterceptor)
@Controller("lol")
export class LolController {
    constructor(private readonly lolService: LolService) {}

    @Post()
    async findUser(@Body() lolDto: LolhDto) {
        return await this.lolService.saveUserAllInfo(lolDto.name, lolDto.tag);
    }

    @Get("user")
    async findUserInfo(@Body() lolUserIdDto: LolUserIdDto) {
        return await this.lolService.findUserProfile(lolUserIdDto.userId);
    }

    @Put("")
    async updateUserChampion(@Body() lolUserIdDto: LolUserIdDto) {
        return await this.lolService.updateUserChampion(lolUserIdDto.userId);
    }
}
