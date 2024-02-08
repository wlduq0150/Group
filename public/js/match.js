const matchingSocket = io(socketURL + "/matching", {
    transports: ["websocket"],
});

matchingSocket.on("startMatching", () => {
    alert("매칭 중!");
});

matchingSocket.on("stopMatching", () => {
    alert("매칭 종료!");
});

matchingSocket.on("completeMatching", () => {
    alert("매칭 성공!");
});

matchingSocket.on("error", (data) => {
    console.log(data);
    alert(`[error] ${data.message}`);
});

function match() {
    const mode = prompt(
        "게임 모드를 입력해주세요. (nomal-game, rank-game, team-rank, aram)",
    );
    const people = +prompt("인원 수를 입력해주세요. (2~5)");
    const tier = +prompt("티어를 입력해주세요. (0~8)");
    const position = prompt("포지션을 입력해주세요. (mid, sup, adc, jg, top)");

    matchingSocket.emit("startMatching", {
        groupClientId: socket.id,
        mode,
        people,
        tier,
        position,
    });
}
