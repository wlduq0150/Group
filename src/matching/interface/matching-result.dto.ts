import { Position } from "src/group/type/position.type";
import { MatchedUser } from "./matched-user.dto";

export interface MatchingResult {
    tier: string;
    mode: string;
    matchedPosition: Position[];
    matchedGroup: MatchedUser[];
}
