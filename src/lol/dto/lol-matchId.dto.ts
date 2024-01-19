import { IsNotEmpty, IsString } from "class-validator";

export class LolMatchIdDto {
    @IsString()
    @IsNotEmpty()
    matchId: string;

    @IsString()
    @IsNotEmpty()
    puuid: string;
}
