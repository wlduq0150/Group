import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { ConfigService } from "@nestjs/config";
import { User } from "discord.js";

@Injectable()
export class GroupRecordService {
    constructor(
        private readonly redisService: RedisService,
        private readonly configService: ConfigService
    ) {
    }


    async getGroupList(userId: number): Promise<User[]> {
        const result = await this.redisService.get(`record_${userId}`); // record_13
        const userIds = (JSON.parse(result)); // [ 14, 17 ]

        return userIds;
    }

    /**최근그룹 플레이어 저장하기
     * @param originUsers 함께하는 플레이어 목록
     * @param userId 유저 Id
     */
    async setRecentGroupList(originUsers: number[], userId: number) {
        const group = await this.redisService.get(`record_${userId}`);
        const data = JSON.parse(group);
        const groupMaxRecord: number = this.configService.get("GROUP_RECORD");
        let array = [];

        if (data) {
            array = data;
        }

        // originUsers = [13, 14, 15] => user = 13, user = 14, user = 15

        for (const user of originUsers) {
            // data = [13, 14, 17]
            if (data) {
                if (data.includes(user)) {
                    const index = data.indexOf(user);
                    if (index !== -1) {
                        data.splice(index, 1);
                    }
                }
            }
            array.push(user);
        }
        if (array.length > groupMaxRecord) {
            array.slice(array.length - groupMaxRecord - 1);
        }
        await this.redisService.set(`record_${userId}`, JSON.stringify(array));
        console.log(userId, await this.redisService.get(`record_${userId}`));

    }
}
