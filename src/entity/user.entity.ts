import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity({
    name: "users", // 데이터베이스 테이블의 이름
})
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    discordId: string;

    @Column()
    username: string;

    @Column()
    avatar: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
