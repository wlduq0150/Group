import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// 테이블명 => camel case, 열 이름 => snake case
@Entity({
    name: "userInfo" // 데이터베이스 테이블의 이름
})
export class UserInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    puuid: string;

    @Column({ name: "game_name" })
    gameName: string;

    @Column()
    gameTag: string;

    @Column({ name: "previous_id" })
    previous_id: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    popular: number;

    @Column()
    gender: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
