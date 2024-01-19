import { Module } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Module({
    providers: [RedisService],
    controllers: [],
    exports: [RedisService],
})
export class RedisModule {}
