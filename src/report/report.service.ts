import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import path from "path";
import { FilterWords } from "src/entity/filter-word.entity";
import { Repository } from "typeorm";
import fs from "fs";
import { CreateReportDto } from "./dtos/createReport.dto";
import { ReportList } from "src/entity/report-list.entity";
import { UserService } from "src/user/user.service";
import { User } from "src/entity/user.entity";
import { IReportServive } from "./interfaces/report.service.interface";

@Injectable()
export class ReportService implements IReportServive {
    constructor(
        @InjectRepository(FilterWords)
        private readonly filterWordRepository: Repository<FilterWords>,
        @InjectRepository(ReportList)
        private readonly reportRepository: Repository<ReportList>,
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
    async createReport(reportData: CreateReportDto): Promise<ReportList> {
        const user = await this.userService.findOneById(reportData.reportUser);

        const newReport: ReportList = this.reportRepository.create({
            ...reportData,
            reportUser: user,
        });

        if (reportData.reportContent) {
            const isAbusive: boolean = await this.processReport(
                reportData.reportContent,
            );

            if (isAbusive) {
                user.reportCount += 3;
            } else {
                user.reportCount += 1;
            }
            await this.userService.save(user);
        }

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
}
