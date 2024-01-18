import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LolServer } from "./constants/lol-server.constants";

@Injectable()
export class LolService {
    constructor(private readonly configService: ConfigService) {}
    //이름+태그로 유저의 승률, 티어, 챔피언의 승률, kda 가져오기
    async findUser(name: string, tag: string) {
        const userPuuid = await this.findUserPuuid(name, tag);

        const userTier = await this.findTier(userPuuid.puuid);

        const count: number = userTier[0].wins + userTier[0].losses;
        const userMatchIds = await this.findMatchIds(userPuuid.puuid, count);
        const userChampions = await this.allMatches(
            userMatchIds,
            userPuuid.puuid,
        );
        const clearChampions = userChampions
            .filter((e) => {
                return e != null;
            })
            .sort((a, b) => b.total - a.total);

        return {
            name: name,
            tag: tag,
            tier: userTier[0].tier,
            rank: userTier[0].rank,
            leaguePoints: userTier[0].leaguePoints,
            wins: userTier[0].wins,
            losses: userTier[0].losses,
            champion: clearChampions,
        };
    }

    //유저 id로 유저 repositoty에서 이름, 태그 가져오는 함수
    private async findUserNameTag(userId: number) {}

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

        const summmonerId = await this.findSummonerId(puuid);
        const response = await fetch(
            `${krServer}lol/league/v4/entries/by-summoner/${summmonerId.id}?api_key=${apiKey}`,
            { method: "GET" },
        );

        const user = await response.json();
        return user;
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
        if (userMatch.info.gameDuration > 300) {
            const thisUser = userMatch.info.participants.filter(
                (player) => player.puuid == puuid,
            );
            return { thisUser, matchId: matchId };
        }
        return false; //다시하기의 경우
    }

    //matchId[]로 puuid에 해당하는 유저의 match정보를 배열로 받음
    private async allMatches(matchIds: string[], puuid: string) {
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
                        total: 0,
                        wins: 0,
                        losses: 0,
                        kills: 0,
                        deaths: 0,
                        assists: 0,
                    };
                }

                //이겼을때
                if (one_match.thisUser[0].win) {
                    champions[one_match.thisUser[0].championId].total += 1;
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
                    champions[one_match.thisUser[0].championId].total += 1;
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
}
