import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";

import { LolDto } from "./dto/lol.dto";
import { LolService } from "./lol.service";
import { LolUserIdDto } from "./dto/lol-userId.dto";
import { UserService } from "src/user/user.service";

// @UseInterceptors(CacheInterceptor)
@Controller("lol")
export class LolController {
    constructor(
        private readonly lolService: LolService,
        private readonly userService: UserService
    ) {
    }

    //유저 생성
    @Post()
    async findUser(@Body() lolDto: LolDto) {
        return await this.lolService.saveUserAllInfo(
            lolDto.name,
            lolDto.tag,
            lolDto.userId
        );
    }

    // @Post("userNameTag")
    // async findUserByNameTag(@Body() lolDto: LolDto, @Session() session) {
    //     return await this.lolService.findUserByNameTag(
    //         lolDto.name,
    //         lolDto.tag,
    //         session.userId,
    //     );
    // }

    //디코아이디로 롤유저 검색
    @Get("discordUser/:userId")
    async findUserByUserId(@Param("userId") userId: number) {
        return await this.lolService.findUserByUserId(userId);
    }

    //롤유저 아이디로 롤유저 검색
    @Get("user/:userId")
    async findUserInfo(@Param("userId") userId: number) {
        return await this.lolService.findUserProfile(userId);
    }

    @Put("")
    async updateUserChampion(@Body() lolUserIdDto: LolUserIdDto) {
        return await this.lolService.updateUserChampion(lolUserIdDto.userId);
    }

    @Get("/:id/groupList")
    async getGroupList(@Param("id") userId: number) {
        const users = await this.lolService.getGroupList(userId);

        return users;
    }

    // @Post("getPuuid")
    // async findUserPuuid(@Body() lolDto: LolDto) {
    //     const a = await this.lolService.findUserPuuid(lolDto.name, lolDto.tag);
    //     return a;
    // }

}
