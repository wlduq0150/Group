import { PickType } from "@nestjs/mapped-types";
import { IsNumber } from "class-validator";
import { ReportList } from "src/entity/report-list.entity";

export class CreateReportDto extends PickType(ReportList, [
    "reportCategory",
    "reportLocation",
    "reportContent",
    "reportDetail",
    "isProcessed",
]) {
    @IsNumber()
    reportedUser: number;

    @IsNumber()
    reportedAgainstUser: number;
}
