import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FriendController } from "./friend.controller";
import { FriendService } from "./friend.service";
import { User } from "src/entity/user.entity";
import { RedisModule } from "src/redis/redis.module";
import { RedisService } from "src/redis/redis.service";
import { UserModule } from "src/user/user.module";
import { NoticeModule } from "src/notice/notice.module";
import { FriendGateway } from "./friend.gateway";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        RedisModule,
        UserModule,
        NoticeModule,
    ],
    controllers: [FriendController],
    providers: [FriendService, FriendGateway],
    exports: [FriendService],
})
export class FriendModule {}
