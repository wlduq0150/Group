import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import { ReportService } from "./report.service";
import { CreateReportDto } from "./dtos/createReport.dto";
import { ReportList } from "src/entity/report-list.entity";

@Controller("report")
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    @Post("loadFilterWords")
    async loadFilterWords() {
        return await this.reportService.loadFilterWords();
    }

    @Post("/create")
    createReport(@Body() reportData: CreateReportDto): Promise<ReportList> {
        console.log("reportData", reportData);
        console.log(
            "reportData",
            reportData.reportCategory,
            reportData.reportContent,
            reportData.reportDetail,
            reportData.reportLocation,
            reportData.reportUser,
        );
        return this.reportService.createReport(reportData);
    }
}
