import { IsObject, IsString } from "class-validator";
import { User } from "src/entity/user.entity";

export class FriendRequestDto {
    @IsObject()
    sender: User;

    @IsString()
    accepterId: number;
}
