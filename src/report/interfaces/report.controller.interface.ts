import { ReportList } from "src/entity/report-list.entity";
import { CreateReportDto } from "../dtos/createReport.dto";

export interface IReportController {
    loadFilterWords(): Promise<string[]>;
    createReport(reportData: CreateReportDto): Promise<ReportList>;
}
