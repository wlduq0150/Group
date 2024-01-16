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
        const userPuuid = await fetch(getUser, { method: "GET" })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                //console.log(data);
                return data;
            });
        //puuid로 유저정보 summonerid,accountId,puuidId,name,profileIconId,revisionDate,summonerLevel
        const userSummoner = await fetch(
            `${krServer}lol/summoner/v4/summoners/by-puuid/${userPuuid.puuid}?api_key=${apiKey}`,
            { method: "GET" },
        )
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log(data);
                return data;
            });
        //return userSummoner;
        //aCUySrAC906MqCs00g01vmZqXgf6viV1AimzylwGqWyHaycS
        const userChampion = await fetch(
            `${krServer}lol/champion-mastery/v4/champion-masteries/by-puuid/${userPuuid}?api_key=${apiKey}`,
            { method: "GET" },
        )
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                return data;
            });

        //return userChampion;
    }

    async findMatchIds(puuid: string) {
        const start = 0;
        const count = 20;
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

    async findMatches(matchId: string) {
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
        return userMatch; //participants[]
    }

    async findTier(summmonerId: string) {
        const user = await fetch(
            `${krServer}lol/league/v4/entries/by-summoner/${summmonerId}?api_key=${apiKey}`,
            { method: "GET" },
        )
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                return data;
            });
        return user; //유저의 큐형태,티어,랭크,점수,이름,id, 승리,패배
    }
}
