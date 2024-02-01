import { Module, forwardRef } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";
import { AuthModule } from "src/auth/auth.module";
import { ConfigService } from "@nestjs/config";

@Module({
    imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
    exports: [UserService],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
