import * as winston from "winston";
import * as winstonMongoDB from "winston-mongodb";

const transports = [
    new winston.transports.Console({
        format: winston.format.combine(
            // Add a timestamp to the console logs
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(
                ({ timestamp, level, message, context, trace }) => {
                    return `${timestamp} [${context}] ${level}: ${message}${
                        trace ? `\n${trace}` : ""
                    }`;
                },
            ),
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
];

export const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports,
});
