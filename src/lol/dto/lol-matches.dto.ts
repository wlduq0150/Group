import { IsNotEmpty } from "class-validator";

export class LolMatchesDto {
    @IsNotEmpty()
    matches: string[];

    @IsNotEmpty()
    puuid: string;
}
