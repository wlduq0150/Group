import {
    IsBoolean,
    IsDate,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import {
    Column,
    CreateDateColumn,
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
    reportedUser: User;

    @ManyToOne(() => User, (user) => user.reportLists)
    reportedAgainstUser: User;

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

    @CreateDateColumn()
    reportDate: Date;

    @Column({ default: false })
    @IsOptional()
    @IsBoolean()
    isProcessed: boolean;
}
