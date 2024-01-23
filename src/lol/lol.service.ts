import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LolServer } from "./constants/lol-server.constants";
import { InjectRepository } from "@nestjs/typeorm";
import { LolUser } from "src/entity/lol-user.entity";
import { Repository } from "typeorm";
import { LolChampion } from "src/entity/lol-champion.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class LolService {
    constructor(
        @InjectRepository(LolUser)
        private lolUserRepository: Repository<LolUser>,
        @InjectRepository(LolChampion)
        private lolChampionRepository: Repository<LolChampion>,
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    //이름+태그로 유저의 승률, 티어, 챔피언의 승률, kda 가져오기
    // async findUser(name: string, tag: string) {
    //     const userPuuid = await this.findUserPuuid(name, tag);

    //     const userTier = await this.findTier(userPuuid.puuid);

    //     const count: number = userTier[0].wins + userTier[0].losses;
    //     const userMatchIds = await this.findMatchIds(userPuuid.puuid, count);
    //     const userChampions = await this.allMatches(
    //         userMatchIds,
    //         userPuuid.puuid,
    //     );
    //     const clearChampions = userChampions
    //         .filter((e) => {
    //             return e != null;
    //         })
    //         .sort((a, b) => b.total - a.total);

    //     return {
    //         name: name,
    //         tag: tag,
    //         tier: userTier[0].tier,
    //         rank: userTier[0].rank,
    //         leaguePoints: userTier[0].leaguePoints,
    //         wins: userTier[0].wins,
    //         losses: userTier[0].losses,
    //         champion: clearChampions,
    //     };
    // }

    async findUserProfile(userId: number) {
        const userCacheKey: string = `userCache:id${userId}`;
        const userCache: string = await this.cacheManager.get(userCacheKey);
        if (userCache) {
            const userInfo = JSON.parse(userCache) as
                | LolUser
                | {
                      user: LolUser;
                      champion: LolChampion[];
                  };
            return userInfo;
        }

        const user = await this.findUserInfo(userId);
        const champion = await this.lolChampionRepository.find({
            where: { lolUserId: userId },
            order: { total: "DESC" },
        });
        await this.cacheManager.set(
            userCacheKey,
            JSON.stringify({ user, champion }),
            50000,
        );
        return { user, champion };
    }

    //유저생성
    async saveUserAllInfo(name: string, tag: string, discordUserId: number) {
        //if(!discordUserId)
        const userInfo = await this.saveLolUser(name, tag, discordUserId);
        await this.saveChampionData(userInfo.id);
    }

    //유저 롤 정보 저장
    private async saveLolUser(
        name: string,
        tag: string,
        discordUserId: number,
    ) {
        const userPuuid = await this.findUserPuuid(name, tag);

        const { user, profileIconId, summonerLevel } = await this.findTier(
            userPuuid.puuid,
        );
        await this.lolUserRepository.save({
            gameName: name,
            gameTag: tag,
            nameTag: name + tag,
            summonerLevel: summonerLevel,
            profileIconId: profileIconId,
            puuid: userPuuid.puuid,
            tier: user[0].tier,
            rank: user[0].rank,
            leaguePoints: user[0].leaguePoints,
            wins: user[0].wins,
            losses: user[0].losses,
            userId: discordUserId,
            lastMatchId: "no",
        });
        const thisUser = await this.lolUserRepository.findOne({
            where: { nameTag: name + tag },
        });
        return thisUser;
    }

    //챔피언 정보 저장
    private async saveChampionData(userId: number) {
        const userInfo = await this.findUserInfo(userId);

        const count = Number(userInfo.wins) + Number(userInfo.losses);

        const userMatchIds = await this.findMatchIds(userInfo.puuid, count);

        const userChampions = await this.allMatches(
            userMatchIds,
            userInfo.puuid,
            userId,
        );
        const clearChampions = userChampions
            .filter((e) => {
                return e != null;
            })
            .sort((a, b) => b.wins - a.wins);
        await this.lolUserRepository.update(
            { id: userId },
            { lastMatchId: clearChampions.shift() },
        );
        for (let champ of clearChampions) {
            await this.lolChampionRepository.save({
                championId: champ.id,
                championName: champ.name,
                total: champ.wins + champ.losses,
                wins: champ.wins + champ,
                losses: champ.losses,
                kills: champ.kills,
                deaths: champ.deaths,
                assists: champ.assists,
                lolUserId: champ.lolUserId,
            });
        }
    }

    //유저 id로 유저 repositoty에서 유저정보 가져오는 함수
    private async findUserInfo(userId: number) {
        const lolUserInfor = await this.lolUserRepository.findOneBy({
            id: userId,
        });
        return lolUserInfor;
    }

    //이름 +태그로 puuid 가져오기
    private async findUserPuuid(name: string, tag: string) {
        const asiaServer: string = LolServer[0];
        const apiKey: string = this.configService.get("LOL_API_KEY");

        const response = await fetch(
            `${asiaServer}riot/account/v1/accounts/by-riot-id/${name}/${tag}?api_key=${apiKey}`,
            { method: "GET" },
        );
        const userPuuid = await response.json();
        return userPuuid; //puuid, gameName, gameTag
    }

    //puuid로 summonerId가져오기
    private async findSummonerId(puuid: string) {
        const krServer: string = LolServer[1];
        const apiKey: string = this.configService.get("LOL_API_KEY");

        const response = await fetch(
            `${krServer}lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`,
            { method: "GET" },
        );
        const userSummoner = await response.json();
        return userSummoner; //id(==summonerId), accountId,puuid,name,profileIconId,revisionDate,summonerLevel
    }

    //puuid로 가져온 summonerId로 유저의 티어, 승리, 패배, 프로필 정보 가져옴
    private async findTier(puuid: string) {
        const krServer: string = LolServer[1];
        const apiKey: string = this.configService.get("LOL_API_KEY");

        const summmonerInfo = await this.findSummonerId(puuid);
        const response = await fetch(
            `${krServer}lol/league/v4/entries/by-summoner/${summmonerInfo.id}?api_key=${apiKey}`,
            { method: "GET" },
        );

        const user = await response.json();

        return {
            user,
            profileIconId: summmonerInfo.profileIconId,
            summonerLevel: summmonerInfo.summonerLevel,
        };
    }

    //puuid로 해당하는 유저의 최근 count 판의 matchId[]가져오기
    private async findMatchIds(puuid: string, count: number) {
        const asiaServer: string = LolServer[0];
        const apiKey: string = this.configService.get("LOL_API_KEY");

        const start: number = 0;
        if (count > 100) {
            count = 100;
        }

        const respose = await fetch(
            `${asiaServer}lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}&api_key=${apiKey}`,
            { method: "GET" },
        );
        const userMatchIds = await respose.json();
        return userMatchIds; //promise
    }

    //matchId로 puuid를 가진 유저의 match정보 가져오기
    private async findMatches(matchId: string, puuid: string) {
        const asiaServer: string = LolServer[0];
        const apiKey: string = this.configService.get("LOL_API_KEY");

        const response = await fetch(
            `${asiaServer}lol/match/v5/matches/${matchId}?api_key=${apiKey}`,
            { method: "GET" },
        );
        const userMatch = await response.json();
        //다시하기는 제외하기
        if (userMatch.info.gameDuration > 250) {
            const thisUser = userMatch.info.participants.filter(
                (player) => player.puuid == puuid,
            );

            return { thisUser, matchId: matchId };
        }
        return false; //다시하기의 경우
    }

    //matchId[]로 puuid에 해당하는 유저의 match정보를 배열로 받음
    private async allMatches(
        matchIds: string[],
        puuid: string,
        userId: number,
    ) {
        const champions = [];

        for (let matchId of matchIds) {
            const one_match = await this.findMatches(matchId, puuid);
            //다시하기 제외 로직
            if (one_match) {
                //배열에 championId번째 객체가 비어있을 경우 championId번째 배열에 챔피언 객체 생성
                if (!champions[one_match.thisUser[0].championId]) {
                    champions[one_match.thisUser[0].championId] = {
                        id: one_match.thisUser[0].championId,
                        name: one_match.thisUser[0].championName,
                        wins: 0,
                        losses: 0,
                        kills: 0,
                        deaths: 0,
                        assists: 0,
                        lolUserId: userId,
                    };
                }

                //이겼을때
                if (one_match.thisUser[0].win) {
                    champions[one_match.thisUser[0].championId].wins += 1;
                    champions[one_match.thisUser[0].championId].kills +=
                        one_match.thisUser[0].kills;
                    champions[one_match.thisUser[0].championId].deaths +=
                        one_match.thisUser[0].deaths;
                    champions[one_match.thisUser[0].championId].assists +=
                        one_match.thisUser[0].assists;
                    champions[0] = one_match.matchId;
                    //졌을 때
                } else {
                    champions[one_match.thisUser[0].championId].losses += 1;
                    champions[one_match.thisUser[0].championId].kills +=
                        one_match.thisUser[0].kills;
                    champions[one_match.thisUser[0].championId].deaths +=
                        one_match.thisUser[0].deaths;
                    champions[one_match.thisUser[0].championId].assists +=
                        one_match.thisUser[0].assists;
                    champions[0] = one_match.matchId;
                }
            }
        }

        return champions;
    }

    //유저 정보 업데이트
    async updateUserChampion(userId) {
        const userInfo = await this.findUserInfo(userId);
        const preTotal: number =
            Number(userInfo.wins) + Number(userInfo.losses);
        //새로운 유저 정보
        const { user, profileIconId, summonerLevel } = await this.findTier(
            userInfo.puuid,
        );
        const newTotal: number = user[0].wins + user[0].losses;
        //새롭게 플레이 한 게임만 갱신
        if (newTotal > preTotal) {
            await this.lolUserRepository.update(
                { id: userId },
                {
                    tier: user[0].tier,
                    rank: user[0].rank,
                    leaguePoints: user[0].leaguePoints,
                    wins: user[0].wins,
                    losses: user[0].losses,
                },
            );

            const count = 3;

            const newMatchIds = await this.findMatchIds(userInfo.puuid, count);
            const newChampions = await this.allMatches(
                newMatchIds,
                userInfo.puuid,
                userId,
            );
            await this.lolUserRepository.update(
                { id: userId },
                { lastMatchId: newChampions.shift() },
            );
            const clearChampions = newChampions.filter((e) => {
                return e != null;
            });

            for (let champ of clearChampions) {
                //기존에 저장된 챔피언 정보
                const preChampion = await this.lolChampionRepository.findOneBy({
                    championId: champ.id,
                });
                if (preChampion) {
                    await this.lolChampionRepository.update(
                        { lolUserId: userId, championId: champ.id },
                        {
                            total:
                                +preChampion.total + champ.wins + champ.losses,
                            wins: +preChampion.wins + champ.wins,
                            losses: +preChampion.losses + champ.losses,
                            kills: +preChampion.kills + champ.kills,
                            deaths: +preChampion.deaths + champ.deaths,
                            assists: +preChampion.assists + champ.assists,
                        },
                    );
                }
                //새롭게 플레이 한 챔피언의 경우 롤챔피언에 생성해줌
                else {
                    await this.lolChampionRepository.save({
                        championId: champ.id,
                        championName: champ.name,
                        total: +champ.wins + champ.losses,
                        wins: champ.wins,
                        losses: champ.losses,
                        kills: champ.kills,
                        deaths: champ.deaths,
                        assists: champ.assists,
                        lolUserId: userId,
                    });
                }
            }
        }
    }
}
