import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import path from "path";
import { FilterWords } from "src/entity/filter-word.entity";
import { Repository } from "typeorm";
import fs from "fs";
import { CreateReportDto } from "./dtos/createReport.dto";
import { ReportList } from "src/entity/report-list.entity";

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(FilterWords)
        private readonly filterWordRepository: Repository<FilterWords>,
        @InjectRepository(ReportList)
        private readonly reportRepository: Repository<ReportList>,
    ) {}

    async loadFilterWords() {
        const filePath = path.join(
            process.cwd(),
            "src",
            "resources",
            "fword_list.txt",
        );

        const fileContent = fs.readFileSync(filePath, "utf-8");
        const filterWords = fileContent.split("\n");

        for (const word of filterWords) {
            const entity = new FilterWords();
            entity.category = "언어 폭력";
            entity.word = word;

            await this.filterWordRepository.save(entity);
        }

        return filterWords;
    }

    createReport(reportData: CreateReportDto): Promise<ReportList> {
        const newReport: ReportList = this.reportRepository.create(reportData);

        return this.reportRepository.save(newReport);
    }
}
