import { Module } from "@nestjs/common";
import { NoticeController } from "./notice.controller";
import { NoticeService } from "./notice.service";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [UserModule],
    exports: [NoticeService],
    controllers: [NoticeController],
    providers: [NoticeService],
})
export class NoticeModule {}
