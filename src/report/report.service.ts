import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import path from "path";
import { FilterWords } from "src/entity/filter-word.entity";
import { Repository } from "typeorm";
import fs from "fs";
import { CreateReportDto } from "./dtos/createReport.dto";
import { Report } from "src/entity/report-list.entity";
import { UserService } from "src/user/user.service";
import { User } from "src/entity/user.entity";
import { IReportServive } from "./interfaces/report.service.interface";
import {
    BanPeriod,
    ReportCountThreshold,
} from "./contants/ban-periods.constant";

@Injectable()
export class ReportService implements IReportServive {
    constructor(
        @InjectRepository(FilterWords)
        private readonly filterWordRepository: Repository<FilterWords>,
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        private readonly userService: UserService,
    ) {}

    async loadFilterWords(): Promise<string[]> {
        const filePath: string = path.join(
            process.cwd(),
            "src",
            "resources",
            "fword_list.txt",
        );

        const fileContent: string = fs.readFileSync(filePath, "utf-8");
        const filterWords: string[] = fileContent.split("\n");

        for (const word of filterWords) {
            let entity: FilterWords = await this.filterWordRepository.findOneBy(
                { word },
            );

            if (!entity) {
                entity = new FilterWords();
                entity.category = "언어 폭력";
                entity.word = word;

                await this.filterWordRepository.save(entity);
            }
        }

        return filterWords;
    }

    // 신고 생성
    async createReport(reportData: CreateReportDto): Promise<Report> {
        const reportedUser: User = await this.userService.findOneById(
            +reportData.reportedUser,
        );
        const reportedAgainstUser: User = await this.userService.findOneById(
            +reportData.reportedAgainstUser,
        );

        const newReport: Report = this.reportRepository.create({
            ...reportData,
            reportedUser,
            reportedAgainstUser,
        });

        if (reportData.reportContent) {
            const isAbusive: boolean = await this.processReport(
                reportData.reportContent,
            );

            if (isAbusive) {
                reportedAgainstUser.reportCount += 3;
            } else {
                reportedAgainstUser.reportCount += 1;
            }
            await this.userService.save(reportedAgainstUser);
        }

        await this.updateBanStatus(reportedAgainstUser);

        return this.reportRepository.save(newReport);
    }

    // 신고 처리
    async processReport(reportContent: string): Promise<boolean> {
        const filterwords: FilterWords[] =
            await this.filterWordRepository.find();

        let isAbusive: boolean = false;
        filterwords.forEach((filterWord) => {
            if (reportContent.includes(filterWord.word)) {
                isAbusive = true;
            }
        });

        return isAbusive;
    }

    // 신고 목록 가져오기
    async getReportList(): Promise<Report[]> {
        return this.reportRepository.find();
    }

    // 정지 상태 업데이트
    async updateBanStatus(user: User) {
        if (user.reportCount < ReportCountThreshold.LEVEL_1) {
            return;
        }

        user.isBanned = true;
        const now = new Date().getTime();
        let banPeriod: number;

        if (
            user.reportCount >= ReportCountThreshold.LEVEL_4 &&
            user.lastBanLevel < ReportCountThreshold.LEVEL_4
        ) {
            banPeriod = BanPeriod.LEVEL_4;
            user.lastBanLevel = ReportCountThreshold.LEVEL_4;
        } else if (
            user.reportCount >= ReportCountThreshold.LEVEL_3 &&
            user.lastBanLevel < ReportCountThreshold.LEVEL_3
        ) {
            banPeriod = BanPeriod.LEVEL_3;
            user.lastBanLevel = ReportCountThreshold.LEVEL_3;
        } else if (
            user.reportCount >= ReportCountThreshold.LEVEL_2 &&
            user.lastBanLevel < ReportCountThreshold.LEVEL_2
        ) {
            banPeriod = BanPeriod.LEVEL_2;
            user.lastBanLevel = ReportCountThreshold.LEVEL_2;
        } else if (user.lastBanLevel < ReportCountThreshold.LEVEL_1) {
            banPeriod = BanPeriod.LEVEL_1;
            user.lastBanLevel = ReportCountThreshold.LEVEL_1;
        } else {
            user.isBanned = false;
        }

        if (user.isBanned) {
            user.banUntil = new Date(now + banPeriod);
        }

        await this.userService.save(user);
    }
}
