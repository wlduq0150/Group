import { PickType } from "@nestjs/mapped-types";
import { IsNumber } from "class-validator";
import { Report } from "src/entity/report-list.entity";

export class CreateReportDto extends PickType(Report, [
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
