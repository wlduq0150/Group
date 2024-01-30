import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "reportList" })
export class ReportList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    reportUser: number;

    @Column()
    reportCategory: string;

    @Column()
    reportLocation: string;

    @Column({ nullable: true })
    reportContent: string;

    @Column()
    reportDetail: string;
}
