import { IsString } from "class-validator";
import { Position } from "../type/position.type";

export class SelectPositionDto {
    @IsString()
    groupId: string;

    @IsString()
    position: Position;
}
