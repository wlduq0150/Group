import { Module } from "@nestjs/common";
import { GroupRecordController } from "./group-record.controller";
import { GroupRecordService } from "./group-record.service";
import { LolModule } from "../lol/lol.module";
import { TypeormModule } from "../typeorm/typeorm.module";
import { RedisModule } from "../redis/redis.module";

@Module({
    imports: [LolModule, TypeormModule, RedisModule],
    controllers: [GroupRecordController],
    providers: [GroupRecordService],
    exports: [GroupRecordService],
})
export class GroupRecordModule {}
