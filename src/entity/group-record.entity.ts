import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LolUser } from "./lol-user.entity";

@Entity({
    name: "groupRecord" // 데이터베이스 테이블의 이름
})
export class GroupRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "group_id" })
    groupId: string;

    @Column({ type: "bigint", name: "user_id" })
    userId: number;

    @Column({ type: "json", name: "player_ids" })
    playerIds: number[];

    @ManyToOne(() => LolUser, (lolUser) => lolUser.groupRecord, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "lolUserId" })
    lolUser: LolUser;

}
