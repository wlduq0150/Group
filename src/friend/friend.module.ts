import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FriendController } from "./friend.controller";
import { FriendService } from "./friend.service";
import { User } from "src/entity/user.entity";
import { RedisModule } from "src/redis/redis.module";
import { RedisService } from "src/redis/redis.service";

@Module({
    imports: [TypeOrmModule.forFeature([User]), RedisModule],
    controllers: [FriendController],
    providers: [FriendService, RedisService],
    exports: [FriendService],
})
export class FriendModule {}
