import { PartialType } from "@nestjs/swagger";
import { CreateGroupDto } from "./create-group.dto";
import { IsObject, IsString } from "class-validator";
import { UpdateGroupPosition } from "../interface/update-group-position.interface";

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
    @IsString()
    groupId: string;

    @IsObject()
    updatePosition: UpdateGroupPosition;
}
