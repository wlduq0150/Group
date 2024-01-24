import { Controller, Param, Sse } from "@nestjs/common";
import { NoticeService } from "./notice.service";

@Controller("notice")
export class NoticeController {
    constructor(private readonly noticeService: NoticeService) {}

    @Sse(":userId")
    sendClientAlarm(@Param("userId") userId: number) {
        return this.noticeService.sendNotice(+userId);
    }
}
