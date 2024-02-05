import { DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FilterWords } from "src/entity/filter-word.entity";
import { LolChampion } from "src/entity/lol-champion.entity";
import { LolUser } from "src/entity/lol-user.entity";
import { ReportList } from "src/entity/report-list.entity";
import { User } from "src/entity/user.entity";
import { GroupRecord } from "../entity/group-record.entity";

@Module({})
export class TypeormModule {
    static forRoot(): DynamicModule {
        const typeormModule: DynamicModule = TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: "mysql",
                host: configService.get<string>("DATABASE_HOST"),
                port: configService.get<number>("DATABASE_PORT"),
                username: configService.get<string>("DATABASE_USERNAME"),
                password: configService.get<string>("DATABASE_PASSWORD"),
                database: configService.get<string>("DATABASE_NAME"),
                entities: [User, LolChampion, LolUser, FilterWords, ReportList, GroupRecord],
                synchronize: true,
                logging: false
            }),
            inject: [ConfigService]
        });

        return {
            module: TypeOrmModule,
            imports: [typeormModule],
            exports: [typeormModule]
        };
    }
}