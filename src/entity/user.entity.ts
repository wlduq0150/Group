import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserLolInfo } from "./user-lol-info";

@Entity({
    name: "user" // 데이터베이스 테이블의 이름
})
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    discord_id: string;

    @Column()
    username: string;

    @Column({ nullable: true })
    avatar: string;

    @OneToOne(() => UserLolInfo, (userLolInfo) => userLolInfo.user)
    userInfo: UserLolInfo;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
