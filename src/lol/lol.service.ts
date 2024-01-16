import { Injectable } from "@nestjs/common";
import { request } from "https";

const asiaServer = "https://asia.api.riotgames.com/";
const krServer = "https://kr.api.riotgames.com/";
const apiKey = "RGAPI-70a1dd8b-bdd7-4276-8b89-a360dbdc57f7";

//https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/
@Injectable()
export class LolService {
    async findUser(name: string, tag: string) {
        const getUser = `${asiaServer}riot/account/v1/accounts/by-riot-id/${name}/${tag}?api_key=${apiKey}`;
        const userPuuid = await fetch(getUser, { method: "GET" }) //puuid, gameName, gameTag
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                //console.log(data);
                return data;
            });

        return await this.findTier(userPuuid.puuid);
    }

    async findSummonerId(puuid: string) {
        const userSummoner = await fetch(
            `${krServer}lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`,
            { method: "GET" },
        )
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                return data;
            });
        return userSummoner; //id(==summonerId), accountId,puuid,name,profileIconId,revisionDate,summonerLevel
    }

    async findMatchIds(puuid: string) {
        const start = 0;
        const count = 20; //이부분은 추후 유저의 전체판수로 변경할 예정
        const userMatchIds = await fetch(
            `${asiaServer}lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}&api_key=${apiKey}`,
            { method: "GET" },
        )
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                return data;
            });
        return userMatchIds;
    }

    async findMatches(matchId: string, puuid: string) {
        const user = [];
        const userMatch = await fetch(
            `${asiaServer}lol/match/v5/matches/${matchId}?api_key=${apiKey}`,
            { method: "GET" },
        )
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                return data;
            });
        const thisUser = userMatch.info.participants.filter(
            (player) => player.puuid == puuid,
        );
        return thisUser; //participants[]
    }

    async allMatches(matchIds: string[], puuid: string) {
        const user = [];
        const champions = [];
        for (let match of matchIds) {
            const one_match = await this.findMatches(match, puuid);
            user.push(one_match);
            if (!champions[one_match[0].championId]) {
                champions[one_match[0].championId] = {
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
        //console.log(champions); 유저의 챔피언 관련 정보
        return user;
    }

    //티어 승률
    async findTier(puuid: string) {
        const summmonerId = await this.findSummonerId(puuid);
        const user = await fetch(
            `${krServer}lol/league/v4/entries/by-summoner/${summmonerId.id}?api_key=${apiKey}`,
            { method: "GET" },
        )
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                return data;
            });

        return user;
    }
}
