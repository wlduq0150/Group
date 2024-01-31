import { Module } from "@nestjs/common";
import { ReportService } from "./report.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FilterWords } from "src/entity/filter-word.entity";

@Module({
    imports: [TypeOrmModule.forFeature([FilterWords])],
    providers: [ReportService],
    exports: [ReportService],
})
export class ReportModule {}
