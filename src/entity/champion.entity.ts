import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { LolDataChampion } from "./lol-data-champion.entity";

@Entity({
    name: "champion" // 데이터베이스 테이블의 이름
})
export class Champion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    champion: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => LolDataChampion, (lolDataChampion) => lolDataChampion.champion)
    lolDataChampions: LolDataChampion[];
}