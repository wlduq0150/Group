import { Injectable } from "@nestjs/common";

const asiaServer = "https://asia.api.riotgames.com/";
const krServer = "https://kr.api.riotgames.com/";
const apiKey = "RGAPI-70a1dd8b-bdd7-4276-8b89-a360dbdc57f7";

//https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/
@Injectable()
export class LolService {
    //이름+태그로 유저의 승률, 티어, 챔피언의 승률, kda 가져오기
    async findUser(name: string, tag: string) {
        const response = await fetch(
            `${asiaServer}riot/account/v1/accounts/by-riot-id/${name}/${tag}?api_key=${apiKey}`,
            { method: "GET" },
        ); //puuid, gameName, gameTag
        const userPuuid = await response.json();

        const userTier = await this.findTier(userPuuid.puuid);
        let count: number = userTier[0].wins + userTier[0].losses;
        const userMatchIds = await this.findMatchIds(userPuuid.puuid, count);
        const userChampions = await this.allMatches(
            userMatchIds,
            userPuuid.puuid,
        );
        let clearChampions = userChampions
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

    //이름 +태그로 puuid 가져오기
    async findUserInfo(name: string, tag: string) {
        const response = await fetch(
            `${asiaServer}riot/account/v1/accounts/by-riot-id/${name}/${tag}?api_key=${apiKey}`,
            { method: "GET" },
        );
        const userPuuid = await response.json();
        return userPuuid; //puuid, gameName, gameTag
    }

    //puuid로 summonerId가져오기
    async findSummonerId(puuid: string) {
        const response = await fetch(
            `${krServer}lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`,
            { method: "GET" },
        );
        const userSummoner = await response.json();
        return userSummoner; //id(==summonerId), accountId,puuid,name,profileIconId,revisionDate,summonerLevel
    }

    //puuid로 유저의 티어, 승리, 패배, 프로필 정보
    async findTier(puuid: string) {
        const summmonerId = await this.findSummonerId(puuid);
        //summmonerId로 leagueId, queueType, tier, rank, leaguePoints, wins, losses, veteran, inactive, freshBlood, hotStreak
        const response = await fetch(
            `${krServer}lol/league/v4/entries/by-summoner/${summmonerId.id}?api_key=${apiKey}`,
            { method: "GET" },
        );
        const user = await response.json();
        return user;
    }

    //puuid로 해당하는 유저의 최근 count 판의 matchId[]가져오기
    async findMatchIds(puuid: string, count: number) {
        const start = 0;
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
    async findMatches(matchId: string, puuid: string) {
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
            return thisUser;
        }
        return; //다시하기의 경우
    }

    //matchId[]로 puuid에 해당하는 유저의 match정보를 배열로 받음
    async allMatches(matchIds: string[], puuid: string) {
        const champions = [];
        for (let matchId of matchIds) {
            const one_match = await this.findMatches(matchId, puuid);
            //배열에 championId번째 객체가 비어있을 경우 championId번째 배열에 챔피언 객체 생성
            if (!champions[one_match[0].championId]) {
                champions[one_match[0].championId] = {
                    id: one_match[0].championId,
                    name: one_match[0].championName,
                    total: 0,
                    wins: 0,
                    losses: 0,
                    winRate: 0,
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                    kda: 0,
                };
            }
            //이겼을때
            if (one_match[0].win) {
                champions[one_match[0].championId].total += 1;
                champions[one_match[0].championId].wins += 1;
                champions[one_match[0].championId].winRate = Math.floor(
                    (champions[one_match[0].championId].wins /
                        champions[one_match[0].championId].total) *
                        100,
                );
                champions[one_match[0].championId].kills += one_match[0].kills;
                champions[one_match[0].championId].deaths +=
                    one_match[0].deaths;
                champions[one_match[0].championId].assists +=
                    one_match[0].assists;
                champions[one_match[0].championId].kda = (
                    (one_match[0].kills + one_match[0].assists) /
                    one_match[0].deaths
                ).toFixed(1);
                //졌을 때
            } else {
                champions[one_match[0].championId].total += 1;
                champions[one_match[0].championId].losses += 1;
                champions[one_match[0].championId].kills += one_match[0].kills;
                champions[one_match[0].championId].deaths +=
                    one_match[0].deaths;
                champions[one_match[0].championId].assists +=
                    one_match[0].assists;
                champions[one_match[0].championId].kda = (
                    (one_match[0].kills + one_match[0].assists) /
                    one_match[0].deaths
                ).toFixed(1);
            }
        }
        return champions;
    }
}
