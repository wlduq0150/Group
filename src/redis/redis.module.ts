import { Module } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Module({
    providers: [RedisService],
    exports: [],
    controllers: [],
})
export class RedisModule {}
