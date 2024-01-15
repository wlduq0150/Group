import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: "userInfor" // 데이터베이스 테이블의 이름
})
export class UserInfor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    gameName: string;

    @Column()
    gameTag: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    popular: number;

    @Column()
    gender: string;

    @Column()
    puuid: string;

    @Column()
    previous_id: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
