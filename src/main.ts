import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import {
    DocumentBuilder,
    SwaggerCustomOptions,
    SwaggerModule,
} from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { IoAdapter } from "@nestjs/platform-socket.io";
import session from "express-session";
import { RedisIoAdapter } from "./adapters/redis-io.adapter";
import { RedisService } from "./redis/redis.service";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({
        origin: true,
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            whitelist: true,
            // forbidNonWhitelisted: true,
        }),
    );

    const redisService = app.get(RedisService);
    const redisIoAdapter = new RedisIoAdapter(app, redisService);
    await redisIoAdapter.connectToRedis();

    app.useWebSocketAdapter(redisIoAdapter);

    // Swagger
    const swaggerCustomOptions: SwaggerCustomOptions = {
        swaggerOptions: {
            persistAuthorization: true,
        },
    };

    const config = new DocumentBuilder()
        .setTitle("Trello")
        .setDescription("Trello API description")
        .setVersion("1.0")
        .addTag("Trello")
        .addBearerAuth(
            { type: "http", scheme: "bearer", bearerFormat: "Token" },
            "accessToken",
        )
        .addBearerAuth(
            { type: "http", scheme: "bearer", bearerFormat: "Token" },
            "refreshToken",
        )
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document, swaggerCustomOptions);

    // 환경 변수 설정
    const configService = app.get(ConfigService);
    const port: number = configService.get("SERVER_PORT");

    app.useStaticAssets(join(__dirname, "..", "public"));

    const redisService = app.get(RedisService);
    const redisStore = redisService.getSessionStore();

    // 세션
    app.use(
        session({
            store: redisStore,
            secret: configService.get<string>("SESSION_SECRET"),
            resave: false,
            saveUninitialized: false,
            cookie: {
                path: "/",
                httpOnly: true,
                secure: false,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: "lax",
            },
        }),
    );

    await app.listen(port);
}
bootstrap();
