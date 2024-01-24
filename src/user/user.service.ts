import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { GetUserDto } from "./dto/get-user.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) {}

    // 디스코드 id로 유저 찾기
    async findOneByDiscordId(discordId: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ discordId });

        if (!user) {
            throw new NotFoundException("해당 유저를 찾을 수 없습니다.");
        }

        return user;
    }

    async findDiscordIdByUserId(userId: number): Promise<string> {
        const user = await this.userRepository.findOneBy({
            id: userId,
        });
        if (!user) {
            throw new NotFoundException("해당 유저를 찾을 수 없습니다.");
        }
        return user.discordId;
    }

    async findNameByUserId(userId: number): Promise<string> {
        const user = await this.userRepository.findOneBy({
            id: userId,
        });
        if (!user) {
            throw new NotFoundException("해당 유저를 찾을 수 없습니다.");
        }
        return user.username;
    }
}
