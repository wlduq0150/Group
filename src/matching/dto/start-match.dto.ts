import { IsNumber, IsString } from "class-validator";
import { Position } from "src/group/type/position.type";

export class StartMatchingDto {
    @IsString()
    groupClientId: string;

    @IsString()
    mode: string;

    @IsNumber()
    people: number;

    @IsNumber()
    tier: number;

    @IsString()
    position: Position;
}
