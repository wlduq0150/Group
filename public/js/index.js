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
    socket.on("groupData", function (groups) {
        updateGroupTable(groups);
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

            // if (response.ok) {
            //     window.location.reload();
            // }
        } catch (err) {
            console.error(err);
        }
    }
});

// 그룹 생성 이벤트 처리
const makeGroupBtn = document.querySelector(".make-group");
const groupContainer = document.querySelector("#groupContainer");
const createGroupForm = document.querySelector(".create-group-modal");
const completeBtn = document.querySelector(".complete-btn");
const refreshBtn = document.querySelector(".refresh");

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

    const title = document.querySelector(".group-title-input").value;
    const mode = document.querySelector('select[name="group-game-mode"]').value;
    const tier = document.querySelector('select[name="group-game-tier"]').value;
    const people = document.querySelector(
        'select[name="group-game-people"]',
    ).value;
    const privateCheckbox = document.querySelector(
        '.private-box input[type="checkbox"]',
    );
    const password = document.querySelector(".private-password").value;
    const positions = document.querySelectorAll("#position.selected");

    console.log(positions);

    const selectedPositions = Array.from(positions).map(
        (position) => position.id,
    );

    socket.emit("groupCreate", {
        name: title,
        mode: mode,
        tier: tier,
        people: people,
        private: privateCheckbox.checked,
        password: privateCheckbox.checked ? password : undefined,
        position: selectedPositions,
        owner: userId,
    });

    // window.location.reload();
});

refreshBtn.addEventListener("click", updateGroupTable());

// 로그인 상태 업데이트
async function updateLoginStatus() {
    try {
        const response = await fetch("/auth/session", {
            method: "GET",
        });
        const data = await response.json();
        userId = data.userId;

        console.log(data.userId);
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

    if (!groups) {
        console.error("No groups data to display.");
        return;
    }

    groups.forEach((group) => {
        const tr = document.createElement("tr");
        tr.classList.add("user-group");

        tr.innerHTML = `
        <td>${group.name}</td>
        <td>${group.members}/${group.maxMembers}</td>
        <td><div class="user-rank">${group.tier}</div></td>
        <td>${group.owner}</td>
        <td>${group.queueType}</td>
        ${group.positions
            .map((pos) => `<td><img src="${pos.image}" /></td>`)
            .join("")}`;

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
    selectPosition();
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
