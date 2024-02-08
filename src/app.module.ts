import { Module, OnApplicationBootstrap, OnModuleInit } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigProjectModule } from "./config/config.module";
import { TypeormModule } from "./typeorm/typeorm.module";
import { AuthModule } from "./auth/auth.module";
import { RedisModule } from "./redis/redis.module";
import { GroupModule } from "./group/group.module";
import { DiscordModule } from "./discord/discord.module";
import { FriendModule } from "./friend/friend.module";

import { LolModule } from "./lol/lol.module";
import { CachingModule } from "./caching/caching.module";
import { RedisService } from "./redis/redis.service";
import { ReportService } from "./report/report.service";
import { ReportModule } from "./report/report.module";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { FilterWords } from "./entity/filter-word.entity";
import { Repository } from "typeorm";
import { MatchingModule } from './matching/matching.module';

@Module({
    imports: [
        ConfigProjectModule,
        TypeormModule.forRoot(),
        TypeOrmModule.forFeature([FilterWords]),
        RedisModule,
        LolModule,
        CachingModule.register(),
        AuthModule,
        GroupModule,
        FriendModule,
        DiscordModule,
        ReportModule,
        MatchingModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements OnModuleInit {
    constructor(
        private readonly redisService: RedisService,
        @InjectRepository(FilterWords)
        private readonly filterWordRepository: Repository<FilterWords>,
    ) {}

    async onModuleInit() {
        const client = this.redisService.getRedisClient();
        const filterWords: FilterWords[] =
            await this.filterWordRepository.find();

        await client.set("filterWords", JSON.stringify(filterWords));
    }
}
