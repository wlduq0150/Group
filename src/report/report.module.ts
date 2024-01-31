import { Module } from "@nestjs/common";
import { ReportService } from "./report.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FilterWords } from "src/entity/filter-word.entity";
import { ReportController } from "./report.controller";
import { ReportList } from "src/entity/report-list.entity";

@Module({
    imports: [TypeOrmModule.forFeature([FilterWords, ReportList])],
    providers: [ReportService],
    exports: [ReportService],
    controllers: [ReportController],
})
export class ReportModule {}
