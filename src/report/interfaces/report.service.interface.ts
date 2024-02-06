import { Report } from "src/entity/report-list.entity";
import { CreateReportDto } from "../dtos/createReport.dto";

export interface IReportServive {
    loadFilterWords(): Promise<string[]>;
    createReport(reportData: CreateReportDto): Promise<Report>;
    processReport(reportContent: string): Promise<boolean>;
    getReportList(): Promise<Report[]>;
}
