import { PartialType } from "@nestjs/swagger";
import { CreateGroupDto } from "./create-group.dto";
import { IsObject, IsOptional, IsString } from "class-validator";
import { UpdateGroupPosition } from "../interface/update-group-position.interface";

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
    @IsString()
    groupId: string;

    @IsOptional()
    @IsObject()
    updatePosition: UpdateGroupPosition;
}
