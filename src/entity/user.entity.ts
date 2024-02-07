import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { LolUser } from "./lol-user.entity";
import { Report } from "./report-list.entity";

@Entity({
    name: "users", // 데이터베이스 테이블의 이름
})
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    discordId: string;

    @Column()
    username: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ default: 0 })
    reportCount: number;

    @Column({ default: false })
    isBanned: boolean;

    @Column({ nullable: true })
    lastBanLevel: number;

    @Column({ nullable: true })
    banUntil: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(() => User, (user) => user.friends)
    @JoinTable()
    friends: User[];

    @ManyToMany(() => User, (user) => user.blockedUsers)
    @JoinTable()
    blockedUsers: User[];

    @OneToOne(() => LolUser, (lolUser) => lolUser.user)
    lolUser: LolUser;

    @OneToMany(() => Report, (report) => report.reportedUser)
    reports: Report[];

    @OneToMany(() => Report, (report) => report.reportedAgainstUser)
    reporteds: Report[];
}
