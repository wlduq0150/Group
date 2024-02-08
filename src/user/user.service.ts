import { Injectable, NotFoundException } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {
    }

    async findOneById(userId: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: {
                lolUser: true,
                friends: true,
                blockedUsers: true
            }
        });
        if (!user) {
            throw new NotFoundException("해당 유저를 찾을 수 없습니다.");
        }
        return user;
    }

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
            id: userId
        });
        if (!user) {
            throw new NotFoundException("해당 유저를 찾을 수 없습니다.");
        }
        return user.discordId;
    }

    async findNameByUserId(userId: number): Promise<string> {
        const user = await this.userRepository.findOneBy({
            id: userId
        });
        if (!user) {
            throw new NotFoundException("해당 유저를 찾을 수 없습니다.");
        }
        return user.username;
    }

    async save(user: User): Promise<User> {
        return this.userRepository.save(user);
    }


}
