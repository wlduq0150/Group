import { IsNumber, IsString } from "class-validator";

export class SendMessageDto {
    @IsString()
    accepterId: number;

    @IsString()
    message: string;
}
