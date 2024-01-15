import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
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
        if (!keyValue) {
            throw new NotFoundException("해당하는 key에는 value값이 없습니다");
        }
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

    async del(key: string) {
        await this.redisClient.del(key);
        return key;
    }
}
