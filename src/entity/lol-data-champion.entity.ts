import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Champion } from "./champion.entity";
import { UserLolInfoEntity } from "./user-lol-info.entity";

// lol-data-champion.entity.ts
@Entity({
    name: "lolDataChampion" // 데이터베이스 테이블의 이름
})
export class LolDataChampion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    total: number;

    @Column()
    wins: number;

    @Column()
    losses: number;

    @ManyToOne(() => Champion, (champion) => champion.lolDataChampions)
    @JoinColumn({ name: "id" })
    champion: Champion;

    @ManyToOne(() => UserLolInfoEntity, (userLolInfo) => userLolInfo.lolDataChampions)
    @JoinColumn({ name: "id" })
    userLolInfo: UserLolInfoEntity;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}