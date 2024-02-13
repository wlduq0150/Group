import { Controller, Get, Param } from "@nestjs/common";
import { GroupRecordService } from "./group-record.service";

@Controller("group-record")
export class GroupRecordController {
    constructor(private readonly groupRecordService: GroupRecordService) {}

    @Get("/:id/groupList")
    async getGroupList(@Param("id") userId: number) {
        const users = await this.groupRecordService.getGroupList(userId);
        return users;
    }
}
