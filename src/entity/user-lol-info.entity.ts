import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { User } from "./user.entity";
import { LolDataChampion } from "./lol-data-champion.entity";

// 테이블명 => camel case, 열 이름 => snake case
@Entity({
    name: "userLolInfo" // 데이터베이스 테이블의 이름
})
export class UserLolInfoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (User) => User.userInfo)
    @JoinColumn({ name: "id" })
    user: User;


    @Column({ unique: true })
    puuid: string;

    @Column({ name: "game_name" })
    game_name: string;

    @Column()
    game_tag: string;

    @Column({ name: "previous_id" })
    previous_id: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    popular: number;

    @Column()
    gender: string;

    @Column()
    tier: number;

    @Column()
    rank: string;

    @Column()
    leaguePoint: number;

    @Column()
    winrate: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => LolDataChampion, (lolDataChampion) => lolDataChampion.champion)
    lolDataChampions: LolDataChampion[];
}
