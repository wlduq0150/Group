let userId;
const socket = io("http://localhost:5001/group", {
    transports: ["websocket"],
    cors: {
        origin: "http://127.0.0.1:5500/public/index.html",
        methods: ["GET", "POST"],
    },
});

window.onload = function () {
    updateLoginStatus();

    const params = new URLSearchParams(window.location.search);

    if (params.get("login") === "fail") {
        alert("로그인에 실패했습니다.");
    }
    if (params.get("logout") === "success") {
        alert("로그아웃에 성공했습니다.");
    }

    socket.on("connect", () => {
        console.log("소켓 연결");
        socket.emit("getAllGroup");
    });
    socket.on("getAllGroup", function (data) {
        console.log(data);
        if (Array.isArray(data.groups)) {
            const groups = data.groups.map((groupObj) => {
                const keys = Object.keys(groupObj);
                if (keys.length > 0) {
                    return groupObj[keys[0]];
                }
            });

            updateGroupTable(groups);
        }
    });
};

// 로그인 이벤트 처리
const loginBtn = document.querySelector(".login");

loginBtn.addEventListener("click", async () => {
    if (loginBtn.value === "로그인") {
        window.location.href = "/auth/login";
    } else {
        try {
            const response = await fetch("/auth/logout", {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                loginBtn.value = "로그인";
            }
        } catch (err) {
            console.error(err);
        }
    }
});

// 그룹 생성 이벤트 처리
const makeGroupBtn = document.querySelector(".make-group");
const groupContainer = document.querySelector("#groupContainer");
const createGroupForm = document.querySelector(".create-group-modal");
const completeBtn = document.querySelector(".create-group-modal .complete-btn");
const refreshBtn = document.querySelector(".refresh");
const chattingBtn = document.querySelector(".chatting-img-btn");

makeGroupBtn.addEventListener("click", () => {
    if (loginBtn.value === "로그인") {
        alert("로그인이 필요합니다.");
    } else {
        if (groupContainer.classList.contains("hidden")) {
            groupContainer.classList.remove("hidden");
        } else {
            groupContainer.classList.add("hidden");
        }
    }
});

completeBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    const title = document.querySelector(
        ".create-group-modal .group-title-input",
    ).value;
    const mode = document.querySelector('select[name="group-game-mode"]').value;
    const tier = document.querySelector('select[name="group-game-tier"]').value;
    const people = document.querySelector(
        'select[name="group-game-people"]',
    ).value;
    const privateCheckbox = document.querySelector(
        '.private-box input[type="checkbox"]',
    );
    const password = document.querySelector(".private-password").value;
    const positions = document.querySelectorAll(
        ".position-jg.selected, .position-top.selected,.position-mid.selected,.position-adc.selected,.position-sup.selected",
    );
    const selectedPositions = Array.from(positions).map((position) =>
        position.className.split(" ")[0].replace("position-", ""),
    );

    socket.emit("groupCreate", {
        name: title,
        mode: mode,
        tier: tier,
        people: people,
        owner: userId,
        private: privateCheckbox.checked,
        password: privateCheckbox.checked ? password : undefined,
        position: selectedPositions,
    });

    console.log(positions, selectedPositions);

    groupContainer.classList.add("hidden");
});

refreshBtn.addEventListener("click", () => {
    socket.emit("getAllGroup");
});

// 로그인 상태 업데이트
async function updateLoginStatus() {
    try {
        const response = await fetch("/auth/session", {
            method: "GET",
        });
        const data = await response.json();
        userId = data.userId;

        if (data.userId) {
            loginBtn.value = "로그아웃";
            socket.emit("connectWithUserId", data.userId);
        } else {
            loginBtn.value = "로그인";
        }
    } catch (err) {
        console.error(err);
    }
}

// 그룹 테이블 업데이트
function updateGroupTable(groups) {
    const tableBody = document
        .getElementById("groupTable")
        .querySelector("tbody");
    const existingRows = tableBody.querySelectorAll(".user-group");

    existingRows.forEach((row) => row.remove());

    if (!groups || !Array.isArray(groups)) {
        console.error("No groups data to display.");
        return;
    }

    groups.forEach((group) => {
        const tr = document.createElement("tr");
        tr.classList.add("user-group");
        tr.setAttribute("data-id", group.id);
        tr.id = "profileOpenButton";

        const positionMap = {
            jg: "정글",
            top: "탑",
            mid: "미드",
            adc: "바텀",
            sup: "서폿",
        };

        const positionClassMap = {
            jg: "position_jungle",
            top: "position_top",
            mid: "position_mid",
            adc: "position_bottom",
            sup: "position_support",
        };

        const tierMap = {
            iron: "아이언",
            bronze: "브론즈",
            silver: "실버",
            gold: "골드",
            platinum: "플래티넘",
            emerald: "에메랄드",
            diamond: "다이아몬드",
            master: "마스터",
            grandmaster: "그랜드마스터",
            challenger: "챌린저",
        };

        const modeMap = {
            "nomal-game": "일반게임",
            "rank-game": "솔로랭크",
            "team-rank": "자유랭크",
            aram: "칼바람 나락",
        };

        tr.innerHTML = `
        <td class="group_name">${group.info.name}</td>
        <td class="group_people">${group.state.currentUser}/${
            group.state.totalUser
        }</td>
        <td class="group_tier">
            <div class="user-rank">${tierMap[group.info.tier]}</div>
        </td>
        <td class="group_user"><span class="user">${
            group.info.owner
        }</span></td>
        <td class="group_type">${modeMap[group.info.mode]}</td>
        <td class="group_position">
        ${["jg", "top", "mid", "adc", "sup"]
            .map(
                (pos) =>
                    `<div class="${
                        positionClassMap[pos]
                    }"><img src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/${
                        group.state[pos] && group.state[pos].isActive
                            ? `${positionMap[pos]}흑`
                            : "금지흑"
                    }.png" /></div>`,
            )
            .join("")}
    </td>`;

        tableBody.appendChild(tr);
    });
}

socket.on("connect", () => {
    socket.emit("connectWithUserId", userId);
});

socket.on("disconnect", () => {
    console.log("Disconnected from the server");
});

socket.on("chat", (data) => {
    console.log("채팅: ", data);
});

socket.on("groupJoin", (data) => {
    groupId = data.groupId;
    console.log("유저 그룹 참가 완료: ", data);
});

socket.on("groupKicked", (data) => {
    const { kickedUserId } = data;

    if (userId === kickedUserId) {
        socket.emit("groupLeave", { groupId });
        alert("그룹장에 의해 강제퇴장 당하였습니다.");
    }
});

socket.on("groupLeave", () => {
    console.log("유저 그룹 나가기 완료");
});

socket.on("otherGroupLeave", (data) => {
    console.log("유저 그룹 나가기 완료: ", data.userId);
});

socket.on("positionSelect", (data) => {
    console.log("포지션 선택: ", data);
    // selectPosition();
});

socket.on("positionSelected", (data) => {
    if (data.userId === userId) {
        position = data.position;
    }
    console.log("포지션 선택완료: ", data);
});

socket.on("positionDeselected", (data) => {
    console.log("포지션 선택해제완료: ", data);
});

socket.on("error", (data) => {
    alert(`[error] ${data.message}`);
});

socket.on("clear", (data) => {
    console.log(data.message);
});

socket.on("getAllGroup", (data) => {
    allGroup = data.groups;
    console.log("데이터: ", data.groups);
});

chattingBtn.addEventListener("click", (e) => {
    const checkCatting = document.getElementById("groupManageContainer");
    if (checkCatting.className == "hidden") {
        checkCatting.classList.remove("hidden");
    } else {
        checkCatting.classList.add("hidden");
    }
});
