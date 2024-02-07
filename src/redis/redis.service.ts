import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import IORedis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";

@Injectable()
export class RedisService {
    private readonly redisClient: IORedis;
    private redisStore: connectRedis.RedisStore;

    constructor(private readonly configService: ConfigService) {
        this.redisClient = new IORedis({
            host: this.configService.get<string>("REDIS_HOST"),
            port: this.configService.get<number>("REDIS_PORT"),
            password: this.configService.get<string>("REDIS_PASSWORD"),
        });
        // (선택) Redis 연결 여부 확인
        this.redisClient.on("connect", () => {
            console.log("Connected to Redis");
        });
        this.redisClient.on("error", (err) => {
            console.error("Redis connection error:", err);
        });

        const RedisStore = connectRedis(session);
        this.redisStore = new RedisStore({
            client: this.redisClient,
        });
    }

    getRedisClient(): IORedis {
        return this.redisClient;
    }

    getSessionStore(): connectRedis.RedisStore {
        return this.redisStore;
    }

    async get(key: string) {
        const keyValue = await this.redisClient.get(key);

        return keyValue;
    }

    async set(key: string, value: any) {
        await this.redisClient.set(key, value);

        return value;
    }

    async rename(key: string, newKey: string) {
        await this.redisClient.rename(key, newKey);

        return newKey;
    }

    async del(key: string | string[]) {
        if (typeof key === "string") {
            await this.redisClient.del(key);
        } else {
            await this.redisClient.del(...key);
        }

        return key;
    }

    async clear() {
        await this.redisClient.flushall();
    }

    async getAll() {
        return await this.redisClient.keys("*");
    }

    async scan(keyName: string) {
        return await this.redisClient.scan(0, "MATCH", `${keyName}*`);
    }
}
