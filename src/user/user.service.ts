<<<<<<< HEAD
import { Injectable, NotFoundException } from "@nestjs/common";
=======
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

>>>>>>> 5ea7f2926348a88da7c38d0bf03ebcf8901c5050
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
<<<<<<< HEAD
=======
import { GetUserDto } from "./dto/get-user.dto";
>>>>>>> 5ea7f2926348a88da7c38d0bf03ebcf8901c5050

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
<<<<<<< HEAD
=======
    }

    async findDiscordIdByUserId(userId: number): Promise<string> {
        const user = await this.userRepository.findOneBy({
            id: userId,
        });
        return user.discordId;
    }

    async findNameByUserId(userId: number): Promise<string> {
        const user = await this.userRepository.findOneBy({
            id: userId,
        });
        return user.username;
>>>>>>> 5ea7f2926348a88da7c38d0bf03ebcf8901c5050
    }
}
