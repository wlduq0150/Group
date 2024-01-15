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
    get(key: string) {
        const keyValue = this.redisClient.get(key);
        return keyValue;
    }

    set(key: string, value: any) {
        this.redisClient.set(key, value);
        return value;
    }

    delete(key: string) {
        this.redisClient.del(key);
        return key;
    }
}
