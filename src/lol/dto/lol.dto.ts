import { IsNotEmpty, IsString } from "class-validator";

export class LolDto {
    @IsString()
    @IsNotEmpty({ message: "이름을 입력해 주세요" })
    name: string;

    @IsString()
    @IsNotEmpty({ message: "태그를 입력해 주세요" })
    tag: string;
}
