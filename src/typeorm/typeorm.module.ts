import { DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({})
export class TypeormModule {
    static forRoot(): DynamicModule {
        const typeormModule: DynamicModule = TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: "mysql",
                host: "localhost",
                port: 3306,
                username: "root",
                password: "1q2w3e4r",
                database: "group",
                entities: ["dist/**/**/*.entity.{ts,js}"],
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
