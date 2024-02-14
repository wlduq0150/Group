import {
    Column,
    Entity,
    JoinColumn,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { SendMessage } from "./sendMessage.entity";

@Entity({ name: "messageRoom" })
export class MessageRoom {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    smallId: number;

    @Column()
    bigId: number;

    @OneToMany(() => SendMessage, (sendMessage) => sendMessage.messageRoom, {
        onDelete: "CASCADE",
    })
    @JoinColumn()
    sendMessage: SendMessage[];
}
