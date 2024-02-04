import { Injectable } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class AppService {
    getHello(req: Request) {
        const sessionStore = req.sessionStore;
        const sessions = sessionStore.all((err, sessions) => {
            if (err) {
                console.log("세션 에러");
                return;
            }

            return sessions;
        });
    }
}
