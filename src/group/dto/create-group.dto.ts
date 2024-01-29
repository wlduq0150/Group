import {
    IsArray,
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { Position } from "../type/position.type";

export class CreateGroupDto {
    @IsString()
    name: string;

    @IsString()
    mode: string;

    @IsOptional()
    @IsString()
    people?: number;

    @IsString()
    tier: string;

    @IsBoolean()
    mic: boolean;

    @IsNumber()
    owner: number;

    @IsString({ each: true })
    @IsArray()
    position: Position[];
}
