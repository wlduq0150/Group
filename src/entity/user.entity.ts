import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

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

    @Column()
    avatar: string;
<<<<<<< HEAD

    @Column({ default: 0 })
    reportCount: number;
=======
>>>>>>> d726335f166a2be760907136b29e2cff2e712166

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
}
