import { PickType } from "@nestjs/mapped-types";
import { ReportList } from "src/entity/report-list.entity";

export class CreateReportDto extends PickType(ReportList, [
    "reportUser",
    "reportCategory",
    "reportLocation",
    "reportContent",
    "reportDetail",
]) {}
