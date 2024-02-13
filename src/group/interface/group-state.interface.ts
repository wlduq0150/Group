export interface GroupState {
    totalUser: number;
    currentUser: number;
    users: number[];
    mid: { isActive: boolean; userId: number | null };
    adc: { isActive: boolean; userId: number | null };
    sup: { isActive: boolean; userId: number | null };
    top: { isActive: boolean; userId: number | null };
    jg: { isActive: boolean; userId: number | null };
}
