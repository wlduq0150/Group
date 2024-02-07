import { IsNumber, IsOptional, IsString } from "class-validator";
import { Position } from "src/group/type/position.type";

export class FindMatchingUserDto {
    @IsOptional()
    @IsString()
    mode?: string;

    @IsOptional()
    @IsNumber()
    people?: number;

    @IsOptional()
    @IsNumber()
    tier?: number;

    @IsOptional()
    @IsString()
    position?: Position;

    @IsOptional()
    @IsString()
    matchingClientId?: string;
}
