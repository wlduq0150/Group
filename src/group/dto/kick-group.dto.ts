import { IsNumber } from "class-validator";

export class KickDto {
    @IsNumber()
    kickedUserId: number;
}
