import { IsString } from "class-validator";

export class FindGroupUsersDto {
    @IsString()
    groupId: string;
}
