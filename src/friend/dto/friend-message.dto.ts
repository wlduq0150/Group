import { IsNumber, IsString } from "class-validator";

export class SendMessageDto {
    @IsNumber()
    friendId: number;

    @IsString()
    message: string;
}
