import { DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FilterWords } from "src/entity/filter-word.entity";
import { LolChampion } from "src/entity/lol-champion.entity";
import { LolUser } from "src/entity/lol-user.entity";
import { MessageRoom } from "src/entity/messageRoom.endtity";
import { SendMessage } from "src/entity/sendMessage.entity";
import { User } from "src/entity/user.entity";
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
                entities: [
                    User,
                    LolChampion,
                    LolUser,
                    SendMessage,
                    MessageRoom,
                    FilterWords,
                ],

                synchronize: true,
                logging: false,
            }),
            inject: [ConfigService],
        });

        return {
            module: TypeOrmModule,
            imports: [typeormModule],
            exports: [typeormModule],
        };
    }
}
