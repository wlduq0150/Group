import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { ConfigModule } from "@nestjs/config";
import discordConfig from "src/config/discord.config";

@Module({
    imports: [
        UserModule,
        ConfigModule.forRoot({
            load: [discordConfig],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
