import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigProjectModule } from "./config/config.module";
import { TypeormModule } from "./typeorm/typeorm.module";
import { AuthModule } from "./auth/auth.module";
import { RedisModule } from "./redis/redis.module";
import { FriendModule } from "./friend/friend.module";
import { GroupModule } from "./group/group.module";
import { DiscordModule } from "./discord/discord.module";

@Module({
    imports: [
        ConfigProjectModule,
        TypeormModule.forRoot(),
        AuthModule,
        RedisModule,
        FriendModule,
        GroupModule,
        DiscordModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
