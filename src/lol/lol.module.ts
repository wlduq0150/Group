import { Module } from "@nestjs/common";
import { LolService } from "./lol.service";
import { LolController } from "./lol.controller";

@Module({
    imports: [],
    exports: [LolService],
    controllers: [LolController],
    providers: [LolService],
})
export class LolModule {}
