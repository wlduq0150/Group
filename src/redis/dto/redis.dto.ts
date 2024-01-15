import { IsNotEmpty, IsString } from "class-validator";

export class RedisDto {
    @IsString()
    @IsNotEmpty({ message: "문자열 key를 작성해 주세요" })
    key: string;

    @IsNotEmpty({ message: "value 작성해 주세요" })
    value: any;
}
