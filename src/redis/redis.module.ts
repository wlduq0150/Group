import { Module } from "@nestjs/common";
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';

@Module({
    providers: [ RedisService],
    exports: [],
    controllers: [RedisController]
})
export class RedisModule {

}