import { IsNumber } from "class-validator";


export class DeleteFriendDto {
    @IsNumber()
    friendId: number;

}
