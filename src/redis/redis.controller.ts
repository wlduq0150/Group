import { Body, Controller, Get, Post } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { RedisDto } from "./dto/redis.dto";

@Controller("redis")
export class RedisController {
    private readonly redisService: RedisService;

    @Get()
    getRedis(@Body() redisDto: RedisDto) {
        const redises = this.redisService.get(redisDto.key);
    }
}
