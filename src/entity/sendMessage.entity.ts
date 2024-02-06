import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MessageRoom } from "./messageRoom.endtity";

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

    @ManyToOne(() => MessageRoom, (messageRoom) => messageRoom.sendMessage)
    @JoinColumn({ name: "messageRoomId", referencedColumnName: "id" })
    messageRoom: MessageRoom;

    @Column()
    messageRoomId: number;
}
