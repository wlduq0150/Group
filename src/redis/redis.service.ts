import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import IORedis from "ioredis";

@Injectable()
export class RedisService {
    private readonly redisClient: IORedis;
    constructor(private readonly configService: ConfigService) {
        this.redisClient = new IORedis({
            host: this.configService.get<string>("REDIS_HOST"),
            port: this.configService.get<number>("REDIS_PORT"),
            password: this.configService.get<string>("REDIS_PASSWORD"),
            //db: this.configService.get<number>("REDIS_DB"),
        });
        // (선택) Redis 연결 여부 확인
        this.redisClient.on("connect", () => {
            console.log("Connected to Redis");
        });
        this.redisClient.on("error", (err) => {
            console.error("Redis connection error:", err);
        });
    }
    async get(key: string) {
        const keyValue = await this.redisClient.get(key);
        return keyValue;
    }

    async set(key: string, value: any) {
        await this.redisClient.set(key, value);
        return value;
    }

    async delete(key: string) {
        await this.redisClient.del(key);
        return key;
    }

    async clear() {
        await this.redisClient.flushall();
    }

    async getAll() {
        return await this.redisClient.keys("*");
    }

    getRedisClient() {
        return this.redisClient;
    }

    getRedis(): IORedis {
        return this.redisClient;
    }
}
