import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity({ name: "reportList" })
export class ReportList {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reportLists)
    reportUser: User;

    @Column()
    reportCategory: string;

    @Column()
    reportLocation: string;

    @Column({ nullable: true })
    reportContent: string;

    @Column()
    reportDetail: string;
}
