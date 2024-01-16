import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Champion } from "./champion.entity";

// lol-user-champion.entity.ts
@Entity({
    name: "lolDataChampion" // 데이터베이스 테이블의 이름
})
export class lolDataChampion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    total: number;

    @Column()
    wins: number;

    @Column()
    losses: number;

    @ManyToOne(() => Champion, (Champion) => Champion.lolDataChmpion)
    @JoinColumn()
    champion_id: Champion;

    @ManyToOne
    @JoinColumn(() )
    user_id: number;

}