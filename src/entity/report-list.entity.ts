import { IsNumber, IsOptional, IsString } from "class-validator";
import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { PickType } from "@nestjs/mapped-types";

@Entity({ name: "reportList" })
export class ReportList {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reportLists)
    reportUser: User;

    @Column()
    @IsString()
    reportCategory: string;

    @Column()
    @IsString()
    reportLocation: string;

    @Column({ nullable: true })
    @IsString()
    @IsOptional()
    reportContent?: string;

    @Column()
    @IsString()
    reportDetail: string;
}
