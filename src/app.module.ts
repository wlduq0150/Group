import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigProjectModule } from "./config/config.module";
import { TypeormModule } from "./typeorm/typeorm.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { RedisModule } from "./redis/redis.module";
import { GroupModule } from "./group/group.module";

@Module({
    imports: [
        ConfigProjectModule,
        TypeormModule.forRoot(),
        AuthModule,
        UserModule,
        RedisModule,
        GroupModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
