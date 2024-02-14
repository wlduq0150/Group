export function genMatchingKeyOption(
    matchingClientId: string,
    mode: string,
    people: number,
    tier: number,
    position: string,
) {
    const matchingUserKeyOption = `matching:user:${
        matchingClientId ? matchingClientId : "*"
    }:${mode ? mode : "*"}:${people ? people : "*"}:${
        tier >= 0 && tier < 10 ? tier : "*"
    }:${position ? position : "*"}`;

    return matchingUserKeyOption;
}
