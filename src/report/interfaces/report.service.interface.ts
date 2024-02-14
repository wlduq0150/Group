import { Report } from "src/entity/report-list.entity";
import { CreateReportDto } from "../dtos/createReport.dto";
import { User } from "src/entity/user.entity";

export interface IReportServive {
    loadFilterWords(): Promise<string[]>;
    createReport(reportData: CreateReportDto): Promise<Report>;
    processReport(reportContent: string): Promise<boolean>;
    getReportList(): Promise<Report[]>;
    updateBanStatus(user: User): Promise<void>;
}
