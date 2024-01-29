import { IsNumber, IsString } from "class-validator";

export class SendMessageDto {
    @IsNumber()
    frinedId: string;

    @IsString()
    message: string;
}
