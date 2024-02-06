import { IsNumber } from "class-validator";

export class MessageRoomDto {
    @IsNumber()
    userOne: number;

    @IsNumber()
    userTwo: number;
}
