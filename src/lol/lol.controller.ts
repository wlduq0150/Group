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
        console.log(lolDto);
        return await this.lolService.saveUserAllInfo(
            lolDto.name,
            lolDto.tag,
            lolDto.userId,
        );
    }

    //디코아이디로 롤유저 검색
    @Get("discordUser/:userId")
    async findUserByUserId(@Param("userId") userId: number) {
        return await this.lolService.findUserByUserId(userId);
    }

    //유저id로 롤유저 이름 테그 검색
    @Get("userNameTag/:userId")
    async findUserNameTag(@Param("userId") userId: number) {
        return await this.lolService.findUserNameTag(userId);
    }

    //롤유저 아이디로 롤유저 검색
    @Get("user/:userId")
    async findUserInfo(@Param("userId") userId: number) {
        return await this.lolService.findUserProfile(userId);
    }

    //유저정보 업데이트
    @Put("")
    async updateUserChampion(@Body() lolUserIdDto: LolUserIdDto) {
        return await this.lolService.updateUserChampion(lolUserIdDto.userId);
    }
}
