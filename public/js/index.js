let userId;
let groupId;
let allGroups = [];
let blockedUsers = [];
let friends = [];
const friendSocket = io("/friend");
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

    socket.on("getAllGroup", function (data) {
        if (Array.isArray(data.groups)) {
            allGroups = data.groups.map((groupObj) => {
                const keys = Object.keys(groupObj);
                if (keys.length > 0) {
                    return groupObj[keys[0]];
                }
            });

            console.log("그룹목록: ", allGroups);

            updateGroupTable(allGroups);
        }
    });

    socket.emit("getAllGroup");
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

// 유저 클릭 모달창
document.querySelector("#userClickContainer").addEventListener("click", (e) => {
    document
        .querySelectorAll("#userClickContainer .user_click_modal div")
        .forEach((target) => {
            target.classList.add("hidden");
        });

    e.currentTarget.classList.add("hidden");
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
    const mode = document.querySelector(
        'select[name="create-group-game-mode"]',
    ).value;
    const tier = document.querySelector(
        'select[name="create-group-game-tier"]',
    ).value;
    const people = document.querySelector(
        'select[name="create-group-game-people"]',
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
            const response = await fetch(`/user/detail/${data.userId}`, {
                method: "GET",
            });
            const user = await response.json();

            blockedUsers = user.blockedUsers.map((blockedUser) => {
                return blockedUser.id;
            });

            console.log("차단유저: ", blockedUsers);

            friends = user.friends.map((friend) => {
                return friend.id;
            });

            console.log("친구: ", friends);

            document.querySelector("#profile .discord-user-name").innerHTML =
                `${user.username}`;
            loginBtn.value = "로그아웃";
            //롤 유저 확이 함수
            const res = await fetch(`/lol/discordUser/${data.userId}`, {
                method: "GET",
            });
            const checkUser = await res.json();
            if (!checkUser) {
                const lolName = prompt("롤 닉네임을 입력해 주세요");
                const lolTag = prompt("롤 테그를 입력해 주세요");
                fetch(`/lol/userNameTag`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: lolName,
                        tag: lolTag,
                    }),
                }).then((e) => console.log("유저 생성이 완료 되었습니다"));
            }

            socket.emit("connectWithUserId", data.userId);
            friendSocket.emit("connectWithUserId", data.userId);
        } else {
            loginBtn.value = "로그인";
        }
    } catch (err) {
        console.error(err);
    }
}

// 그룹 테이블 업데이트
async function updateGroupTable(groups) {
    const tableBody = document
        .getElementById("groupTable")
        .querySelector("tbody");
    const existingRows = tableBody.querySelectorAll(".user-group");

    existingRows.forEach((row) => row.remove());

    if (!groups || !Array.isArray(groups)) {
        console.error("No groups data to display.");
        return;
    }

    for (let group of groups) {
        // 유저 이름 불러오기
        let userName;
        try {
            const response = await fetch(`/user/${group.info.owner}`, {
                method: "GET",
            });
            userName = await response.text();
        } catch (e) {
            console.log(e);
        }

        const tr = document.createElement("tr");
        tr.classList.add("user-group");
        tr.dataset.id = group.groupId;
        tr.onclick = joinGroup;

        groupId = group.id;

        tr.innerHTML = `
        <td class="group_name">${group.info.name}</td>
        <td class="group_people">${group.state.currentUser}/${
            group.state.totalUser
        }</td>
        <td class="group_tier">
            <div class="user-rank">${Enum.Tier[group.info.tier]}</div>
        </td>
        <td class="group_user"><span class="user_click user" oncontextmenu="showUserClickModal(event)" data-id="${
            group.info.owner
        }">${userName}</span></td>
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
    }

    groups.forEach((group) => {});
}

// 그룹 참가 함수
function joinGroup(e) {
    const target = e.currentTarget;
    const groupId = target.dataset.id;
    socket.emit("groupJoin", { groupId });
}

// 그룹 나가기 함수
function leaveGroup() {
    socket.emit("groupLeave", { groupId });
}

// 그룹 상태 변경시 그룹 상태를 변경
function updateMyGroupState(groupState) {
    updateSelectPositionState(groupState);
}

// 그룹 관리창 업데이트
async function updateGroupManageState(groupInfo, groupState) {
    const titleElement = document.querySelector(".group_manage_header .title");
    const modeElement = document.querySelector(".group_manage_header .mode");
    const ownerElement = document.querySelector(
        ".group_manage_header .owner_name",
    );

    let ownerName;
    try {
        const response = await fetch(`/user/${groupInfo.owner}`, {
            method: "GET",
        });
        ownerName = await response.text();
    } catch (e) {
        console.log(e);
    }

    titleElement.textContent = `${groupInfo.name}`;
    modeElement.innerHTML = `${
        Enum.Mode[groupInfo.mode]
    } <span class="number">${groupState.currentUser}/${
        groupState.totalUser
    }</span>`;
    ownerElement.innerHTML = `${ownerName}`;
}

// 그룹 관리창 초기화(그룹 나갈시에 발생)
function resetGroupManageState() {
    const titleElement = document.querySelector(".group_manage_header .title");
    const modeElement = document.querySelector(".group_manage_header .mode");
    const ownerElement = document.querySelector(".group_manage_header .owner");
    const chatList = document.querySelector(".group_manage_chat_list");

    titleElement.innerHTML = "";
    modeElement.innerHTML = "";
    ownerElement.innerHTML = "";
    chatList.innerHTML = "";
}

// 그룹 역할 상태 변경시 업데이트
async function updateSelectPositionState(groupState) {
    const positions = ["jg", "top", "mid", "adc", "sup"];

    for (let pos of positions) {
        const target = document.querySelector(
            `.select-position-parent .position-${pos}`,
        );
        const { isActive, userId } = groupState[pos];

        if (!isActive) {
            setSPForbidden(target);
            continue;
        }

        if (!userId) {
            setSPDisable(target);
            continue;
        }

        // 유저 이름 불러오기
        let userName;
        try {
            const response = await fetch(`/user/${userId}`, {
                method: "GET",
            });
            userName = await response.text();
        } catch (e) {
            console.log(e);
        }

        setSPActive(target, userName);
    }
}

// 그룹 역할 상태 초기화(그룹 나갈시에 발생)
function resetSelectPositionState() {
    const positions = ["jg", "top", "mid", "adc", "sup"];

    for (let pos of positions) {
        const target = document.querySelector(
            `.select-position-parent .position-${pos}`,
        );
        setSPDisable(target);
    }
}

// 그룹 설정 상태 변경시 업데이트
async function updateGroupUpdateState(groupInfo, groupState) {}

// 그룹 설정 상태 초기화(그룹 나갈시에 발생)
function resetGroupUpdateState() {}

// 그룹 관리창 보이기/숨기기 이벤트
chattingBtn.addEventListener("click", () => {
    const checkManage = document.getElementById("groupManageContainer");
    if (checkManage.classList.contains("hidden")) {
        showGroupManage();
    } else {
        hideGroupManage();
    }
});

//그룹 나가기
document
    .querySelector("#groupManageContainer .leave_group_btn")
    .addEventListener("click", (e) => {
        leaveGroup();
    });

// 포지션 선택/해제
document
    .querySelectorAll(".select-position-parent #position-box")
    .forEach((positionTarget) => {
        positionTarget.addEventListener("click", (e) => {
            const target = e.currentTarget;
            const pos = target.classList[0].replace("position-", "");

            if (checkIsSelected(target)) {
                socket.emit("positionDeselect", { groupId, position: pos });
            } else {
                socket.emit("positionSelect", { groupId, position: pos });
            }
        });
    });

// 채팅 보내기
document
    .querySelector("#groupManageContainer .chat_send")
    .addEventListener("click", (e) => {
        const message = document.querySelector(
            "#groupManageContainer .chat_input",
        ).value;

        socket.emit("chat", { message });
    });

//엔터로 채팅 보내기
const pressEnter = document.querySelector("#groupManageContainer .chat_input");
pressEnter.addEventListener("keypress", (e) => {
    if (e.keyCode == 13) {
        socket.emit("chat", { message: pressEnter.value });
        pressEnter.value = "";
    }
});

socket.on("connect", () => {
    console.log("group 소켓 연결");
});

socket.on("disconnect", () => {
    console.log("Disconnected from the server");
});

socket.on("chat", (data) => {
    const { chat } = data;
    createChatMessage(userId, chat.userId, chat.name, chat.message);
});

socket.on("groupJoin", (data) => {
    console.log("유저 그룹 참가 완료: ", data);
    groupId = data.groupId;
    const { groupInfo, groupState } = data;
    updateGroupManageState(groupInfo, groupState);
    updateGroupUpdateState(groupInfo, groupState);
    updateMyGroupState(groupState);
});

socket.on("groupKicked", (data) => {
    const { kickedUserId } = data;

    if (userId === kickedUserId) {
        socket.emit("groupLeave", { groupId });
        alert("그룹장에 의해 강제퇴장 당하였습니다.");
    }
});

socket.on("groupLeave", () => {
    resetGroupManageState();
    resetSelectPositionState();
    resetGroupUpdateState();
    hideGroupManage();
    console.log("유저 그룹 나가기 완료");
});

socket.on("otherGroupLeave", (data) => {
    console.log("유저 그룹 나가기 완료: ", data);
    const { groupInfo, groupState } = data;
    updateGroupManageState(groupInfo, groupState);
});

socket.on("positionSelect", (data) => {
    showSelectPosition();
});

socket.on("positionSelected", async (data) => {
    const { groupState } = data;
    updateSelectPositionState(groupState);
    updateGroupUpdateState(null, groupState);
});

socket.on("positionDeselected", (data) => {
    const { groupState } = data;
    updateSelectPositionState(groupState);
    updateGroupUpdateState(null, groupState);
});

socket.on("error", (data) => {
    console.log(data);
    alert(`[error] ${data.message}`);
});

friendSocket.on("connect", () => {
    console.log("friend 소켓 연결");
});

friendSocket.on("disconnect", () => {
    console.log("friend 소켓 연결 해제");
});

friendSocket.on("friendRequest", (data) => {
    showFriendRequest(data.user);
});

friendSocket.on("friendComplete", (data) => {
    friends.push(data.friendId);
});
