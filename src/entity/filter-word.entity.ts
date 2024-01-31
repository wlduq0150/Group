import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "filterWords" })
export class FilterWords {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    category: string;

    @Column()
    word: string;
}
