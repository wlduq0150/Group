import { Enum } from "./path/to/groupInfo.constants.js";

let userId;
let groupId;
let allGroups = [];
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
            allGroups = data.groups.map((groupObj) => {
                const keys = Object.keys(groupObj);
                if (keys.length > 0) {
                    return groupObj[keys[0]];
                }
            });

            updateGroupTable(allGroups);
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

// 새로고침 이벤트 처리
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

        groupId = group.id;
        console.log("그룹 아이디: ", groupId);

        tr.innerHTML = `
        <td class="group_name">${group.info.name}</td>
        <td class="group_people">${group.state.currentUser}/${
            group.state.totalUser
        }</td>
        <td class="group_tier">
            <div class="user-rank">${Enum.Tier[group.info.tier]}</div>
        </td>
        <td class="group_user"><span class="user" data-id="${
            group.info.owner
        }">${group.info.owner}</span></td>
        <td class="group_type">${Enum.Mode[group.info.mode]}</td>
        <td class="group_position">
        ${["jg", "top", "mid", "adc", "sup"]
            .map(
                (pos) =>
                    `<div class="${
                        Enum.PositionClass[pos]
                    }"><img src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/${
                        group.state[pos] && group.state[pos].isActive
                            ? `${Enum.Position[pos]}흑`
                            : "금지흑"
                    }.png" /></div>`,
            )
            .join("")}
    </td>`;

        tableBody.appendChild(tr);
    });
}

// 채팅 이벤트
chattingBtn.addEventListener("click", () => {
    const checkCatting = document.getElementById("groupManageContainer");
    if (checkCatting.className == "hidden") {
        checkCatting.classList.remove("hidden");

        let group = allGroups.find((group) => group.id === groupId);
        console.log("그룹: ", group);

        if (!group) {
            console.log("현재 사용자가 속한 그룹이 없습니다.");
        } else {
            const titleElement = document.querySelector(
                ".group_manage_header .title",
            );
            const modeElement = document.querySelector(
                ".group_manage_header .mode",
            );
            const memberElement = document.querySelector(
                ".group_manage_header .number",
            );
            const ownerElement = document.querySelector(
                ".group_manage_header .owner",
            );

            titleElement.textContent = `${group.info.name}님의 그룹`;
            modeElement.textContent = `${group.info.mode}`;
            memberElement.textContent = `${group.state.currentUser}/${group.state.totalUser}`;
            ownerElement.textContent = group.info.owner;
        }
    } else {
        checkCatting.classList.add("hidden");
    }
});

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
