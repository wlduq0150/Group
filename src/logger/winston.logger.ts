import * as winston from "winston";
import {
    WinstonModule,
    utilities as nestWinstonModuleUtilities,
} from "nest-winston";
import * as winstonMongoDB from "winston-mongodb";

const isProduction = process.env.NODE_ENV === "production";

export const logger = WinstonModule.createLogger({
    transports: [
        new winston.transports.Console({
            level: isProduction ? "info" : "debug", //프로덕션 환경에서의 로깅 레벨 / 개발 환경에서의 로깅 레벨
            format: isProduction
                ? winston.format.simple()
                : winston.format.combine(
                      winston.format.timestamp(),
                      winston.format.ms(),
                      nestWinstonModuleUtilities.format.nestLike("MyApp", {
                          colors: true,
                          prettyPrint: true,
                      }),
                  ),
        }),

        new winstonMongoDB.MongoDB({
            level: "info",
            db: process.env.MONGO_DB,
            options: {
                useUnifiedTopology: true,
            },
            collection: "logs",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
        }),
    ],
});
