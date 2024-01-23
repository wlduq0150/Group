import { IsNumber } from "class-validator";

export class LolUserIdDto {
    @IsNumber()
    userId: number;
}
