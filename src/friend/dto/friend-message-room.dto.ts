import { IsNumber, IsObject, IsString } from "class-validator";
import { SendMessageType } from "../interface/sendMessage.interface";

export class RoomMessageDto {
    @IsNumber()
    roomId: number;

    @IsObject()
    message: SendMessageType;
}
