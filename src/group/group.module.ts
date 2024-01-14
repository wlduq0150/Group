import { Module } from "@nestjs/common";
import { GroupService } from "./group.service";
import { GroupGateway } from "src/group/group.gateway";

@Module({
    exports: [GroupService],
    providers: [GroupService, GroupGateway],
})
export class GroupModule {}
