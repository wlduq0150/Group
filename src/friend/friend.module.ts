import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FriendController } from "./friend.controller";
import { FriendService } from "./friend.service";
import { User } from "src/entity/user.entity";
import { RedisModule } from "src/redis/redis.module";
import { RedisService } from "src/redis/redis.service";
import { UserModule } from "src/user/user.module";
import { FriendGateway } from "./friend.gateway";
import { SendMessage } from "src/entity/sendMessage.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, SendMessage]),
        RedisModule,
        UserModule,
    ],
    controllers: [FriendController],
    providers: [FriendService, FriendGateway],
    exports: [FriendService],
})
export class FriendModule {}
