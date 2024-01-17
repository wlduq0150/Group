const main = async () => {
    const champions = {};

    const puuid = "jqnwnN9nbrhfV6dpANDKoAG_TmyWo0xEFlFQ0w093owVmk6mtYOtmF0RpXfOGnbb6dsOAS-jH4UDWw";
    const data = await response.json();
    console.log(data);

    for (const match of data) {
        const data = await response.json();

        const games = data.info.participants.filter(player => player.puuid === puuid);
        games.map((game) => {
            if (!champions[game.championId]) {
                champions[game.championId] = { name: game.championName, total: 0, wins: 0, losses: 0 };
            }

            if (game.win) {
                champions[game.championId].total += 1;
                champions[game.championId].wins += 1;
            } else {
                champions[game.championId].total += 1;
                champions[game.championId].losses += 1;
            }
        });
    }

    const targetKeys = Object.keys(champions)
        .sort((a, b) => champions[b].total - champions[a].total).slice(0, 3);
    const filterChampions = Object.fromEntries(Object.entries(champions).filter(([key]) => targetKeys.includes(key)));

    const userChampions = Object.entries(filterChampions).map(([id, data]) => ({
        userId: 1,
        championId: parseInt(id), ...data
    }));
    // 승률 = 승리 / 승리 + 패배
    console.log(userChampions);
};

main();
