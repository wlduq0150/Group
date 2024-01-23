import { IsNotEmpty, IsString } from "class-validator";

export class LolPuuidDto {
    @IsString()
    @IsNotEmpty()
    puuid: string;
}
