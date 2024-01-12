import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { ConfigModule } from "@nestjs/config";
import discordConfig from "src/config/discord.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([User]),
        ConfigModule.forRoot({
            load: [discordConfig],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
