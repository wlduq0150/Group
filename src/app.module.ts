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

@Module({
    imports: [
        ConfigProjectModule,
        TypeormModule.forRoot(),
<<<<<<< HEAD
        AuthModule,
        LolModule,
=======
>>>>>>> 5ea7f2926348a88da7c38d0bf03ebcf8901c5050
        RedisModule,
        LolModule,
        CachingModule.register(),
        AuthModule,
        GroupModule,
        FriendModule,
<<<<<<< HEAD
=======
        DiscordModule,
>>>>>>> 5ea7f2926348a88da7c38d0bf03ebcf8901c5050
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
