import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";
import { Like, Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { GetUserDto } from "./dto/get-user.dto";


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService
    ) {
    }

    async create(createUserDto: CreateUserDto) {
        const { email } = createUserDto;

        const isUser = await this.findUserByEmail(email);

        if (isUser) {
            throw new ConflictException("이미 존재하는 이메일입니다.");
        }

        const user = await this.userRepository.save(createUserDto);

        return user.id;
    }

    async findAll() {
        return await this.userRepository.find({
            select: ["id", "email", "name", "createdAt", "updatedAt"]
        });
    }

    async findUserById(id: number) {
        return await this.userRepository.findOne({
            where: { id },
            select: ["id", "email", "name", "createdAt", "updatedAt"]
        });
    }

    async findUserByName(getData: GetUserDto) {
        const splits = getData.name.split("#");
        // 케리아아#NA2 => ['케리아아', 'NA2'] => splits.length = 2
        // PB Blossom => ['PB Blossom'] => splits.length = 1
        // ' ' = %20

        const getResponse = async (array: string[]) => {
            if (array.length === 2) {
                // riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
                console.log(`${process.env.LOL_API_ACCOUNT_BASE}${array[0]}/${array[1]}?api_key=${process.env.LOL_API_KEY}`);
                return await fetch(`${process.env.LOL_API_ACCOUNT_BASE}${array[0]}/${array[1]}?api_key=${process.env.LOL_API_KEY}`);
            } else {
                // lol/summoner/v4/summoners/by-name/{summonerName}
                console.log(`${process.env.LOL_API_SUMMONER_BASE}${encodeURI(array[0])}?api_key=${process.env.LOL_API_KEY}`);
                return await fetch(`${process.env.LOL_API_SUMMONER_BASE}${encodeURI(array[0])}?api_key=${process.env.LOL_API_KEY}`);

            }
        };
        // puuid -> match -> 경기기록을 가져와서 통계를 때려야해요
        const response = await getResponse(splits);
        console.log(response);
        if (!response) {
            throw new BadRequestException("검색할 수 없는 유저 입니다.");
        }
        // SELECT * FROM user WHERE name LIKE "(name)%"; => User Entity 여러 개
        // % : 'name'이 포함된 값
        // %name : 앞 문자와 상관없이 'name'이 포함
        // name% : 뒤 문자와 상관없이 'name'이 포함
        // %name% : 양쪽 문자와 상관없이 'name'이 포함
        // 아 -> 아아아
        console.log(response);
        return await this.userRepository.find({
            where: {
                name: Like(`${getData}%`)
            }
        });
    }

    async findUserByIdWithBoards(id: number) {
        return await this.userRepository.findOne({
            where: { id },
            select: ["id", "email", "name", "createdAt", "updatedAt"]
        });
    }

    async findUserByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email }
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const isUser = await this.findUserById(id);

        if (!isUser) {
            throw new NotFoundException("존재하지 않는 사용자입니다.");
        }

        const result = await this.userRepository.update(
            {
                id
            },
            {
                ...updateUserDto
            }
        );

        return result;
    }

    async remove(id: number) {
        const isUser = await this.findUserById(id);

        if (!isUser) {
            throw new NotFoundException("존재하지 않는 사용자입니다.");
        }

        const result = await this.userRepository.delete({ id });

        return result;
    }
}
