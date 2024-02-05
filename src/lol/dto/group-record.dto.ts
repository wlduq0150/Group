import { IsNumber } from "class-validator";

export class GroupRecordDto {
    @IsNumber()
    userId: number;
}
