import { IsNumber } from "class-validator";

export class BlockedUserDto {
    @IsNumber()
    blockedId: number;
}
