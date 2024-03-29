import { Injectable } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";
import IORedis from "ioredis";
import { StartMatchingDto } from "./dto/start-match.dto";
import { FindMatchingUserDto } from "./dto/find-match-user.dto";
import Redlock from "redlock";
import { WsException } from "src/group/exception/ws-exception.exception";
import { getDataFromMatchingKey } from "./function/matching-key-to-data.function";
import { MatchedUser } from "./interface/matched-user.dto";
import { Position } from "src/group/type/position.type";
import { genMatchingKeyOption } from "./function/gen-matching-key-option.function";

@Injectable()
export class MatchingService {
    private readonly redisClient: IORedis;
    private readonly redlock: Redlock;

    constructor(private readonly redisService: RedisService) {
        this.redisClient = redisService.getRedisClient();
        this.redlock = new Redlock([this.redisClient], {
            retryCount: 3,
            retryDelay: 300,
        });
    }

    private genMatchingUserKey(
        matchingClientId: string,
        startMatchingDto: StartMatchingDto,
    ) {
        const { mode, people, tier, position } = startMatchingDto;

        return `matching:user:${matchingClientId}:${mode}:${people}:${tier}:${position}`;
    }

    private genMatchingLockKey(startMatchingDto: StartMatchingDto) {
        const { mode, people } = startMatchingDto;

        return `matching:lock:${mode}:${people}`;
    }

    // 조건을 통해 매칭하는 유저 찾기
    async findUserMatchingKeysByOption(
        findMatchingUserDto: FindMatchingUserDto,
    ) {
        const { matchingClientId, mode, people, tier, position } =
            findMatchingUserDto;

        const matchingUserKeyOptions: string[] = [];

        // 티어 범위는 한 단계 위아래 까지 매칭
        const tierRange = [tier - 1, tier, tier + 1];

        // 매칭 옵션을 통해 키 생성
        tierRange.forEach((tier) => {
            const matchingUserKeyOption = genMatchingKeyOption(
                matchingClientId,
                mode,
                people,
                tier,
                position,
            );

            matchingUserKeyOptions.push(matchingUserKeyOption);
        });

        // 매칭 키 옵션을 통해 매칭중인 유저 목록 불러오기
        const matchingPromises = matchingUserKeyOptions.map((keyOption) => {
            return this.redisClient.keys(keyOption);
        });
        const matchingUserKeyLists = await Promise.all([...matchingPromises]);

        // 매칭된 키 목록
        const matchingUserKeys = [];
        matchingUserKeyLists.forEach((keys) => {
            matchingUserKeys.push(...keys);
        });

        return matchingUserKeys;
    }

    async checkIsUserMatching(matchingClientId: string) {
        const matchingUserKeyOption = genMatchingKeyOption(
            matchingClientId,
            "*",
            null,
            -1,
            "*",
        );

        const matchingUserKey = await this.redisClient.keys(
            matchingUserKeyOption,
        );

        if (matchingUserKey.length) {
            return matchingUserKey[0];
        }

        return false;
    }

    // 매칭 시작하기
    async startMatching(
        matchingClientId: string,
        startMatchingDto: StartMatchingDto,
    ) {
        const { groupClientId } = startMatchingDto;
        const matchingUserKey = this.genMatchingUserKey(
            matchingClientId,
            startMatchingDto,
        );

        const isUserMatching = await this.checkIsUserMatching(matchingClientId);
        if (isUserMatching) {
            throw new WsException("이미 매칭중입니다.");
        }

        // 매칭 대기열에 추가
        await this.redisService.set(matchingUserKey, groupClientId);

        // 그룹 매칭
        const matchingResult = await this.makeMatching(startMatchingDto);

        return matchingResult;
    }

    // 매칭 종료하기
    async stopMatching(matchingClientId: string) {
        const matchingUserKey =
            await this.checkIsUserMatching(matchingClientId);

        if (!matchingUserKey) return;

        await this.redisService.del(matchingUserKey);
    }

    // 들어온 사람을 방장으로 삼아 그룹 형성
    async makeMatching(startMatchingDto: StartMatchingDto) {
        const { mode, tier, people } = startMatchingDto;

        const matchingUserLockKey = this.genMatchingLockKey(startMatchingDto);
        const lock = await this.redlock.acquire([matchingUserLockKey], 1000);

        const matchedGroup: MatchedUser[] = [];
        const matchedPosition: Position[] = [];
        const matchedUserKeys: string[] = [];
        let isMatchComplete = false;

        const matchingUserKeys = await this.findUserMatchingKeysByOption({
            ...startMatchingDto,
            position: null,
        });

        try {
            for (let key of matchingUserKeys) {
                const { matchingClientId, position } =
                    getDataFromMatchingKey(key);

                const groupClientId = await this.redisService.get(key);

                // 포지션이 겹치지 않게 매칭
                if (matchedPosition.includes(position)) continue;

                // 매칭된 그룹에 참여
                matchedGroup.push({ matchingClientId, groupClientId });
                matchedUserKeys.push(key);
                matchedPosition.push(position);

                // 인원이 가득 차면 매칭 종료
                if (matchedGroup.length === people) {
                    isMatchComplete = true;
                    break;
                }
            }

            // 만약 매칭이 성공했다면 대기열에서 삭제
            if (isMatchComplete) {
                await this.redisService.del(matchedUserKeys);
                return {
                    mode,
                    tier,
                    matchedPosition,
                    matchedGroup,
                };
            }

            return null;
        } catch (e) {
            throw new WsException(e.message);
        } finally {
            await lock.release();
        }
    }
}
