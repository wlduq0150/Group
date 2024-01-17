import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserLolInfoEntity } from "./user-lol-info.entity";

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

    @OneToOne(() => UserLolInfoEntity, (userLolInfo) => userLolInfo.user)
    userInfo: UserLolInfoEntity;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
