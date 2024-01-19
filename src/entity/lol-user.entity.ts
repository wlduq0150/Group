import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { LolChampion } from "./lol-champion.entity";

@Entity({
    name: "lolUsers", // 데이터베이스 테이블의 이름
})
export class LolUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar" })
    gameName: string;

    @Column({ type: "varchar" })
    gameTag: string;

    @Column({ type: "varchar" })
    nameTag: string;

    @Column({ type: "varchar" })
    puuid: string;

    @Column({ type: "varchar" })
    tier: string;

    @Column({ type: "varchar" })
    rank: string;

    @Column({ type: "bigint" })
    leaguePoints: number;

    @Column({ type: "bigint" })
    wins: number;

    @Column({ type: "bigint" })
    losses: number;

    @Column({ type: "varchar" })
    lastMatchId: string;

    @OneToMany(() => LolChampion, (lolChampions) => lolChampions.lolUser)
    lolChampions: LolChampion[];
}
