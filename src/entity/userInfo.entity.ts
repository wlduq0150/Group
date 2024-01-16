import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: "userInfo" // 데이터베이스 테이블의 이름
})
export class UserInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    puuid: string;

    @Column()
    gameName: string;

    @Column()
    gameTag: string;

    @Column()
    previous_id: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    popular: number;

    @Column()
    gender: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
