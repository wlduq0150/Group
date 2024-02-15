export function generateGroupInfoKey(groupId: string) {
    return `group:info:${groupId}`;
}

export function generateGroupStateKey(groupId: string) {
    return `group:state:${groupId}`;
}

export function generateGroupLockKey(groupId: string) {
    return `group:lock:${groupId}`;
}

export function generateUserDataKey(userId: number) {
    return `user:${userId}:data`;
}
