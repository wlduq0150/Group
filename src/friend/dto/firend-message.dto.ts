import { IsNumber, IsString } from "class-validator";

export class SendMessageDto {
    @IsNumber()
    accepterId: number;

    @IsString()
    message: string;
}
