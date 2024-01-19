import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { LolUser } from "./lol-user.entity";

@Entity({
    name: "lolChampions", // 데이터베이스 테이블의 이름
})
export class LolChampion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "bigint" })
    championId: number;

    @Column({ type: "varchar" })
    championName: string;

    @Column({ type: "bigint" })
    total: number;

    @Column({ type: "bigint" })
    wins: number;

    @Column({ type: "bigint" })
    losses: number;

    @Column({ type: "bigint" })
    kills: number;

    @Column({ type: "bigint" })
    deaths: number;

    @Column({ type: "bigint" })
    assists: number;

    @ManyToOne(() => LolUser, (lolUser) => lolUser.lolChampions)
    @JoinColumn({ name: "lolUserId" })
    lolUser: LolUser;

    @Column({ type: "bigint" })
    lolUserId: number;
}
