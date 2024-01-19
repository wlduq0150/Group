import { Module } from "@nestjs/common";
import { LolService } from "./lol.service";
import { LolController } from "./lol.controller";
import { LolChampion } from "src/entity/lol-champion.entity";
import { LolUser } from "src/entity/lol-user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([LolUser, LolChampion])],
    exports: [LolService],
    controllers: [LolController],
    providers: [LolService],
})
export class LolModule {}
