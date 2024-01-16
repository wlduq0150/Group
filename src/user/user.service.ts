import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";
import { Like, Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { GetUserDto } from "./dto/get-user.dto";
import { Cron } from "@nestjs/schedule";
import { UserInfo } from "../entity/userInfo.entity";


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserInfo)
        private readonly userInfoRepository: Repository<UserInfo>,
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
        // SELECT * FROM user WHERE name LIKE "(name)%"; => User Entity 여러 개
        // % : 'name'이 포함된 값
        // %name : 앞 문자와 상관없이 'name'이 포함
        // name% : 뒤 문자와 상관없이 'name'이 포함
        // %name% : 양쪽 문자와 상관없이 'name'이 포함
        // 유저를 검색해서 찾는걸로 O //  라이엇으로 로그인을해서 그 데이터를 기반으로 ->가져와야함
        console.log(response);
        return await this.userRepository.find({
            where: {
                username: Like(`${getData}%`)
            }
        });
    }

    // (초) 분 시 일 월 요일
    // * * * * * => 매 분마다 실행
    // 10 * * * * => 매 시간의 10분에 실행
    // 0-59/3 * * * * => 3분 마다 실행
    @Cron("0 0 * * *")
    async updateUserInfor() {
        const users: UserInfo[] = await this.userInfoRepository.find();
        for (const user of users) {

            const champions = {};
            /*
            {
                "350": { name: 'Yummi', total: 5, wins: 2, losses: 3 }
            }
            */
            //puuid , userId ,response
            const puuid = user.puuid;
            const userId = user.id;
            //puuid통해 match list를 불러오는 API 호출
            const response = await fetch(`${process.env.LOL_API_PUUID_BASE}jqnwnN9nbrhfV6dpANDKoAG_TmyWo0xEFlFQ0w093owVmk6mtYOtmF0RpXfOGnbb6dsOAS-jH4UDWw/ids?start=0&count=20&api_key=${process.env.LOL_API_KEY}`);
            const data = await response.json(); //data를 json 형태로
            console.log(data);

            //sort나 map을 활용할 경우 API요청이 많아져서 undefined뜸
            //그래서 for문을 이용하여 가져오는거임
            for (const match of data) {
                //match 통해서 match 상세 정보 API 호출
                const response = await fetch(`${process.env.LOL_API_MATCH_BASE}${match}?api_key=${process.env.LOL_API_KEY}`);
                const data = await response.json();

                const games = data.info.participants.filter(player => player.puuid === puuid);
                games.map((game) => {
                    // champions의 game.championId가 비어있다면 champions[game.championId]에 새로운 정보 추가
                    if (!champions[game.championId]) {
                        champions[game.championId] = { name: game.championName, total: 0, wins: 0, losses: 0 };
                    }

                    if (game.win) {
                        champions[game.championId].total += 1;
                        champions[game.championId].wins += 1;
                    } else {
                        champions[game.championId].total += 1;
                        champions[game.championId].losses += 1;
                    }
                });
            }

            const targetKeys = Object.keys(champions)
                .sort((a, b) => champions[b].total - champions[a].total).slice(0, 3);
            const filterChampions = Object.fromEntries(Object.entries(champions).filter(([key]) => targetKeys.includes(key)));

            const userChampions = Object.entries(filterChampions).map(([id, data]) => {
                const object = data as {
                    total: number;
                    wins: number;
                    losses: number;
                };

                return {
                    userId: userId,
                    championId: parseInt(id), ...object
                };
            });
        }

        // 케리아아#NA2 => ['케리아아', 'NA2'] => splits.length = 2
        // PB Blossom => ['PB Blossom'] => splits.length = 1
        // ' ' = %20
        /*const getResponse = async (array: string[]) => {
            if (array.length === 2) {
                // riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
                console.log(`${process.env.LOL_API_ACCOUNT_BASE}${array[0]}/${array[1]}?api_key=${process.env.LOL_API_KEY}`);
                return await fetch(`${process.env.LOL_API_ACCOUNT_BASE}${array[0]}/${array[1]}?api_key=${process.env.LOL_API_KEY}`);
            } else {
                // lol/summoner/v4/summoners/by-name/{summonerName}
                console.log(`${process.env.LOL_API_SUMMONER_BASE}${encodeURI(array[0])}?api_key=${process.env.LOL_API_KEY}`);
                return await fetch(`${process.env.LOL_API_SUMMONER_BASE}${encodeURI(array[0])}?api_key=${process.env.LOL_API_KEY}`);
            }
        };*/
        // puuid -> match -> 경기기록을 가져와서 통계를 때려야해요
        //35번 -> 샤코 35번 -> 서버에 저장시킬려고요
        const response = await getResponse(splits);
        console.log(response);
        if (!response) {
            throw new BadRequestException("검색할 수 없는 유저 입니다.");
        }
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
