import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "sendMessages" })
export class SendMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    senderId: number;

    @Column()
    accepterId: number;

    @Column()
    message: string;

    @Column({ type: "timestamp" })
    sendDate: Date;
}
