import { IsInt } from "class-validator";

export class FriendRequestDto {
    @IsInt()
    receiverId: number;
}
