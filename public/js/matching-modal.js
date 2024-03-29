let matchingMode = null;
let matchingPeople = null;
let matchingTier = null;
let matchingPosition = null;

let matchingPage = 1;

let isMatching = false;
let isStartMatching = false;

function clickMatchingMode(e) {
    const target = e.currentTarget;
    console.log(target);

    const currentMode = target.querySelector("#mode").dataset.value;

    if (matchingMode && matchingMode !== currentMode) {
        initMode();
        matchingMode = currentMode;
        target.style.color = "rgb(247, 176, 22)";
        initPeople();
        return;
    }

    if (matchingMode && matchingMode === currentMode) {
        matchingMode = null;
        target.style.color = "rgb(0, 0, 0)";
        initPeople();
        return;
    }

    matchingMode = currentMode;
    initPeople();
    target.style.color = "rgb(247, 176, 22)";
}

function clickMatchingPeople(e) {
    const target = e.currentTarget;

    const currentPeople = +target.querySelector("#people").dataset.value;

    if (matchingPeople && matchingPeople !== currentPeople) {
        initPeople();
        matchingPeople = currentPeople;
        target.style.color = "rgb(247, 176, 22)";
        return;
    }

    if (matchingPeople && matchingPeople === currentPeople) {
        matchingPeople = null;
        target.style.color = "rgb(0, 0, 0)";
        return;
    }

    matchingPeople = currentPeople;
    target.style.color = "rgb(247, 176, 22)";
}

function clickMatchingTier(e) {
    const target = e.currentTarget;

    const currentTier = +target.querySelector("#tier").dataset.value;

    const isMatchingTierNumber = matchingTier === 0 || matchingTier;

    if (isMatchingTierNumber && matchingTier !== currentTier) {
        initTier();
        matchingTier = currentTier;
        target.style.color = "rgb(247, 176, 22)";
        return;
    }

    if (isMatchingTierNumber && matchingTier === currentTier) {
        matchingTier = null;
        target.style.color = "rgb(0, 0, 0)";
        return;
    }

    matchingTier = currentTier;
    target.style.color = "rgb(247, 176, 22)";
}

function clickMatchingPosition(e) {
    const target = e.currentTarget;

    const img = target.querySelector("#position");
    const currentPosition = img.dataset.value;

    if (matchingPosition && matchingPosition !== currentPosition) {
        initPosition();
        matchingPosition = currentPosition;
        const imgSrc = decodeURIComponent(img.src);
        const imgSplit = imgSrc.split("/lane/");
        const imgPos = imgSplit[1].replace(".png", "");
        imgSplit[1] = imgPos.replace("흑", "") + ".png";
        const updateImgSrc = imgSplit.join("/lane/");
        img.src = updateImgSrc;
        return;
    }

    if (matchingPosition && matchingPosition === currentPosition) {
        matchingPosition = null;
        const imgSrc = decodeURIComponent(img.src);
        const imgSplit = imgSrc.split("/lane/");
        const imgPos = imgSplit[1].replace(".png", "");
        imgSplit[1] = imgPos + "흑" + ".png";
        const updateImgSrc = imgSplit.join("/lane/");
        img.src = updateImgSrc;
        return;
    }

    matchingPosition = currentPosition;
    const imgSrc = decodeURIComponent(img.src);
    const imgSplit = imgSrc.split("/lane/");
    const imgPos = imgSplit[1].replace(".png", "");
    imgSplit[1] = imgPos.replace("흑", "") + ".png";
    const updateImgSrc = imgSplit.join("/lane/");
    img.src = updateImgSrc;
}

function clickPrevBtn(e) {
    if (matchingPage === 1) {
        document.querySelector("#matchingContainer").classList.add("hidden");
        return;
    }

    document.querySelector(`.matching-parent .next-btn`).textContent = "다음";

    document.querySelector(`.matching-page-${matchingPage}`).style.display =
        "none";

    matchingPage -= 1;

    document.querySelector(`.matching-page-${matchingPage}`).style.display =
        "flex";

    if (matchingPage === 1) {
        document.querySelector(`.matching-parent .prev-btn`).textContent =
            "취소";
    }
}

function clickNextBtn(e) {
    if (matchingPage === 4) {
        const result = startMatching();
        return;
    }

    document.querySelector(`.matching-parent .prev-btn`).textContent = "이전";

    document.querySelector(`.matching-page-${matchingPage}`).style.display =
        "none";

    matchingPage += 1;

    document.querySelector(`.matching-page-${matchingPage}`).style.display =
        "flex";

    if (matchingPage === 4) {
        document.querySelector(`.matching-parent .next-btn`).textContent =
            "매칭 시작";
    }
}

function startMatching() {
    if (!matchingMode) {
        alert("매칭 모드가 선택되지 않았습니다.");
        return false;
    }

    if (!matchingPeople) {
        alert("매칭 인원이 선택되지 않았습니다.");
        return false;
    }

    const isMatchingTierNumber = matchingTier === 0 || matchingTier;
    if (!isMatchingTierNumber) {
        alert("매칭 티어가 선택되지 않았습니다.");
        return false;
    }

    if (!matchingPosition) {
        alert("매칭 역할이 선택되지 않았습니다.");
        return false;
    }

    isStartMatching = true;

    matchingSocket.emit("startMatching", {
        groupClientId: socket.id,
        mode: matchingMode,
        people: matchingPeople,
        tier: matchingTier,
        position: matchingPosition,
    });

    return true;
}

function openMatching() {
    document.querySelector("#matchingContainer").classList.remove("hidden");

    document.querySelector(`.matching-page-${matchingPage}`).style.display =
        "none";

    matchingPage = 1;

    document.querySelector(`.matching-page-${matchingPage}`).style.display =
        "flex";

    document.querySelector(`.matching-parent .prev-btn`).textContent = "취소";
    document.querySelector(`.matching-parent .next-btn`).textContent = "다음";

    initMatching();
}

function cancleMatching() {
    matchingSocket.emit("stopMatching");
}

function initMode() {
    matchingMode = null;

    document
        .querySelectorAll(".matching-parent .matching-mode-box .select-box")
        .forEach((div) => {
            div.style.color = "rgb(0, 0, 0)";
        });
}

function initPeople() {
    matchingPeople = null;
    console.log(matchingMode);

    document.querySelector(".matching-parent .two-people").style.display =
        "flex";
    document.querySelector(".matching-parent .three-people").style.display =
        "flex";
    document.querySelector(".matching-parent .four-people").style.display =
        "flex";
    document.querySelector(".matching-parent .five-people").style.display =
        "flex";

    document
        .querySelectorAll(".matching-parent .matching-people-box .select-box")
        .forEach((div) => {
            div.style.color = "rgb(0, 0, 0)";
        });

    if (matchingMode === "rank-game") {
        document.querySelector(".matching-parent .three-people").style.display =
            "none";
        document.querySelector(".matching-parent .four-people").style.display =
            "none";
        document.querySelector(".matching-parent .five-people").style.display =
            "none";
    }

    if (matchingMode === "team-rank") {
        document.querySelector(".matching-parent .four-people").style.display =
            "none";
    }
}

function initTier() {
    matchingTier = null;

    document
        .querySelectorAll(".matching-parent .matching-tier-box .select-box")
        .forEach((div) => {
            div.style.color = "rgb(0, 0, 0)";
        });
}

function initPosition() {
    matchingPosition = null;

    document
        .querySelectorAll(".matching-parent .matching-position-box img")
        .forEach((img) => {
            const imgSrc = decodeURIComponent(img.src);
            const imgSplit = imgSrc.split("/lane/");
            const imgPos = imgSplit[1].replace(".png", "");

            if (!imgPos.includes("흑")) {
                imgSplit[1] = imgPos + "흑" + ".png";
            }

            const updateImgSrc = imgSplit.join("/lane/");
            img.src = updateImgSrc;
            return;
        });
}

function initMatching() {
    initMode();
    initPeople();
    initTier();
    initPosition();
}

function openIsMatchingModal() {
    document.querySelector(".is-matching-parent").style.display = "block";

    const isOpenIsMatching = document
        .querySelector("#matchingContainer")
        .classList.contains("hidden");
    if (isOpenIsMatching) {
        document.querySelector("#matchingContainer").classList.add("hidden");
    }
}

function closeIsMatchingModal() {
    document.querySelector(".is-matching-parent").style.display = "none";
    document.querySelector("#matchingContainer").classList.add("hidden");
}

const matchingSocket = io("/matching", {
    transports: ["websocket"],
});

matchingSocket.on("connect", () => {
    console.log("matching 소켓 연결");
});

matchingSocket.on("disconnect", () => {
    console.log("matching 소켓 연결 해제");
});

matchingSocket.on("startMatching", () => {
    isStartMatching = false;
    isMatching = true;
    openIsMatchingModal();
});

matchingSocket.on("stopMatching", () => {
    isMatching = false;
    closeIsMatchingModal();
});

matchingSocket.on("completeMatching", () => {
    isMatching = false;
    closeIsMatchingModal();
    alert("매칭 성공!");
});

matchingSocket.on("error", (data) => {
    console.log(data);
    alert(`[error] ${data.message}`);
});
