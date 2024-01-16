import { Body, Controller, Get } from "@nestjs/common";

import { LolhDto } from "./dto/lol.dto";
import { LolService } from "./lol.service";

@Controller("lol")
export class LolController {
    constructor(private readonly lolService: LolService) {}

    @Get()
    async findUser(@Body() lolDto: LolhDto) {
        return await this.lolService.findUser(lolDto.name, lolDto.tag);
    }
}
