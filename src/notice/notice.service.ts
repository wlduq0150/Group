import { Injectable, MessageEvent } from "@nestjs/common";
import { Observable, Subject, filter, map } from "rxjs";
import { UserService } from "src/user/user.service";

@Injectable()
export class NoticeService {
    constructor(private readonly userService: UserService) {}

    private users$: Subject<any> = new Subject();

    private observer = this.users$.asObservable();

    // 이벤트 발생 함수
    async emitEvent(senderId: number, accepterId: number) {
        const sender = await this.userService.findOneById(senderId);

        this.users$.next({ sender, accepterId });
    }

    // 이벤트 스트림 구독
    sendNotice(userId: number): Observable<any> {
        return this.observer.pipe(
            filter((data) => data.accepterId === userId),
            map((data) => {
                return {
                    data: {
                        sender: data.sender,
                    },
                } as MessageEvent;
            }),
        );
    }
}
