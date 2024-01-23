import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { LolUser } from "./lol-user.entity";

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

    @ManyToMany(() => User, (user) => user.reportedUsers)
    @JoinTable()
    reportedUsers: User[];

    @Column({ default: false })
    isSuspended: boolean;

    @OneToOne(() => LolUser, (lolUser) => lolUser.user)
    lolUser: LolUser;
}
