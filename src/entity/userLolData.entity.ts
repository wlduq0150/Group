import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "userLolData" // 데이터베이스 테이블의 이름
})
export class UserLolData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    tag: string;

    @Column()
    tier: number;

    @Column()
    rank: string;

    @Column()
    leaguePoint: number;

}