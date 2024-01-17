import { Body, Controller, Get } from "@nestjs/common";

import { LolhDto } from "./dto/lol.dto";
import { LolService } from "./lol.service";
import { LolPuuidDto } from "./dto/lol-puuid.dto";
import { LolMatchIdDto } from "./dto/lol-matchId.dto";
import { LolMatchesDto } from "./dto/lol-matches.dto";

@Controller("lol")
export class LolController {
    constructor(private readonly lolService: LolService) {}

    @Get()
    async findUser(@Body() lolDto: LolhDto) {
        return await this.lolService.findUser(lolDto.name, lolDto.tag);
    }

    @Get("matchIds")
    async findMatches(@Body() lolMatchIdDto: LolMatchIdDto) {
        return await this.lolService.findMatches(
            lolMatchIdDto.matchId,
            lolMatchIdDto.puuid,
        );
    }

    @Get("matches")
    async allMatches(@Body() lolMatchesDto: LolMatchesDto) {
        return await this.lolService.allMatches(
            lolMatchesDto.matches,
            lolMatchesDto.puuid,
        );
    }
}
