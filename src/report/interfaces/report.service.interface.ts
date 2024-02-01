import { User } from "src/entity/user.entity";
import { CreateReportDto } from "../dtos/createReport.dto";
import { ReportList } from "src/entity/report-list.entity";

export interface IReportServive {
    loadFilterWords(): Promise<string[]>;
    createReport(reportData: CreateReportDto): Promise<ReportList>;
    processReport(reportContent: string): Promise<boolean>;
}
