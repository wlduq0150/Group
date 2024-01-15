import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Post,
    Put,
} from "@nestjs/common";
import { RedisService } from "./redis.service";
import { RedisDto } from "./dto/redis.dto";

@Controller("redis")
export class RedisController {
    constructor(private readonly redisService: RedisService) {}

    @Get()
    async getRedis(@Body() redisDto: RedisDto) {
        return await this.redisService.get(redisDto.key);
    }

    @Post()
    async setRedis(@Body() redisDto: RedisDto) {
        return await this.redisService.set(redisDto.key, redisDto.value);
    }

    @Put() //key 이름 변경
    async renameRedis(@Body() redisDto: RedisDto) {
        return await this.redisService.rename(redisDto.key, redisDto.value);
    }

    @Delete()
    async delRedis(@Body() redisDto: RedisDto) {
        return await this.redisService.del(redisDto.key);
    }
}
