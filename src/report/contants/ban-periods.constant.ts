export enum BanPeriod {
    LEVEL_1 = 30 * 24 * 60 * 60 * 1000, // 24시간
    LEVEL_2 = 50 * 72 * 60 * 60 * 1000, // 72시간
    LEVEL_3 = 70 * 168 * 60 * 60 * 1000, // 168시간
    LEVEL_4 = Infinity, // 영구 정지
}

export enum ReportCountThreshold {
    LEVEL_1 = 30,
    LEVEL_2 = 50,
    LEVEL_3 = 70,
    LEVEL_4 = 80,
}
