import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigProjectModule } from "./config/config.module";
import { TypeormModule } from "./typeorm/typeorm.module";
import { AuthModule } from "./auth/auth.module";
import { RedisModule } from "./redis/redis.module";
import { GroupModule } from "./group/group.module";
import { DiscordModule } from "./discord/discord.module";
import { FriendModule } from "./friend/friend.module";

import { LolModule } from "./lol/lol.module";
import { CachingModule } from "./caching/caching.module";
import { NoticeModule } from './notice/notice.module';

@Module({
    imports: [
        ConfigProjectModule,
        TypeormModule.forRoot(),
        RedisModule,
        LolModule,
        CachingModule.register(),
        AuthModule,
        GroupModule,
        FriendModule,
        DiscordModule,
        NoticeModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
