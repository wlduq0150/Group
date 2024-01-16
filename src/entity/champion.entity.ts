import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "champion" // 데이터베이스 테이블의 이름
})
export class Champion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    champion: string;

}