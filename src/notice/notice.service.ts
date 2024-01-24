import { Injectable, MessageEvent } from "@nestjs/common";
import { Observable, Subject, filter, map } from "rxjs";

@Injectable()
export class NoticeService {
    private users$: Subject<any> = new Subject();

    private observer = this.users$.asObservable();

    // 이벤트 발생 함수
    emitEvent(senderId: number, accepterId: number) {
        this.users$.next({ senderId, accepterId });
    }

    // 이벤트 스트림 구독
    sendNotice(userId: number): Observable<any> {
        return this.observer.pipe(
            filter((data) => data.accepterId === userId),
            map((data) => {
                return {
                    data: {
                        senderId: data.senderId,
                    },
                } as MessageEvent;
            }),
        );
    }
}
