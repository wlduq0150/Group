import { Module } from "@nestjs/common";
import { LolService } from "./lol.service";
import { LolController } from "./lol.controller";
import { LolChampion } from "src/entity/lol-champion.entity";
import { LolUser } from "src/entity/lol-user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "src/user/user.module";
import { RedisModule } from "../redis/redis.module";

@Module({
    imports: [RedisModule, TypeOrmModule.forFeature([LolUser, LolChampion]), UserModule],
    exports: [LolService],
    controllers: [LolController],
    providers: [LolService]
})
export class LolModule {
}
