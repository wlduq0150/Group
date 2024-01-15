import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";
import { Position } from "../type/position.type";

export class CreateGroupDto {
    @IsString()
    name: string;

    @IsString()
    mode: string;

    @IsBoolean()
    mic: boolean;

    @IsNumber()
    owner: number;

    @IsString({ each: true })
    @IsArray()
    position: Position[];
}