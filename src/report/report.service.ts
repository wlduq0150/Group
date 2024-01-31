import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import path from "path";
import { FilterWords } from "src/entity/filter-word.entity";
import { Repository } from "typeorm";
import fs from "fs";

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(FilterWords)
        private filterWordRepository: Repository<FilterWords>,
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
}
