import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
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

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    @ManyToOne(() => LolUser, (lolUser) => lolUser.groupRecord, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "lolUserId" })
    lolUser: LolUser;

}
