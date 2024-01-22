import { IsString } from "class-validator";

export class GroupChatDto {
    @IsString()
    message: string;
}
