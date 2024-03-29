import { Body, Controller, Get, HttpStatus, Post } from "@nestjs/common";
import { ReportService } from "./report.service";
import { CreateReportDto } from "./dtos/createReport.dto";
import { IReportController } from "./interfaces/report.controller.interface";
import { Report } from "src/entity/report-list.entity";

@Controller("report")
export class ReportController implements IReportController {
    constructor(private readonly reportService: ReportService) {}

    @Post("loadFilterWords")
    async loadFilterWords(): Promise<string[]> {
        return await this.reportService.loadFilterWords();
    }

    @Post("/create")
    createReport(@Body() reportData: CreateReportDto): Promise<Report> {
        return this.reportService.createReport(reportData);
    }

    @Get("/getReportList")
    async getReportList(): Promise<Report[]> {
        return await this.reportService.getReportList();
    }
}
