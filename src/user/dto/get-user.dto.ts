import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetUserDto {
    @IsString()
    @ApiPropertyOptional({ description: "이름" })
    name: string;
}
