import { IsNumber, IsString } from "class-validator";

export class SendMessageDto {
    @IsNumber()
    friendId: string;

    @IsString()
    message: string;
}
