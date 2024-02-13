let userId;
let groupId;
let blockedUsers = [];
let friends = [];
let friendIds = [];
let blockedUserIds = [];
let isGroupLoading = false;
let isGroupJoining = false;
// const socketURL = "";

//const socketURL = "http://socket-lb-35040061.ap-northeast-2.elb.amazonaws.com";

const socketURL = "";

const friendSocket = io(socketURL + "/friend", {
    transports: ["websocket"],
});
const socket = io(socketURL + "/group", {
    transports: ["websocket"],
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
    if (params.get("banUntil")) {
        const banUntil = new Date(params.get("banUntil"));
        const formattedDate = banUntil.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
        alert(`${formattedDate}까지 계정 정지 상태입니다.`);
    }

    socket.on("getAllGroup", async function (data) {
        let allGroups = [];

        if (Array.isArray(data.groups)) {
            allGroups = data.groups.map((groupObj) => {
                const keys = Object.keys(groupObj);
                if (keys.length > 0) {
                    return groupObj[keys[0]];
                }
            });
        }

        await updateGroupTable(allGroups);
        isGroupLoading = false;
    });

    socket.emit("getAllGroup");
};

// 로그인 이벤트 처리
const loginBtn = document.getElementById("login-btn");

loginBtn.addEventListener("click", async () => {
    console.log(loginBtn);
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

            location.reload();
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
    const people = +document.querySelector(
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
        people: mode === "aram" ? people : null,
        owner: userId,
        private: privateCheckbox.checked,
        password: privateCheckbox.checked ? password : undefined,
        position: mode === "aram" ? [] : selectedPositions,
    });

    groupContainer.classList.add("hidden");
    resetCreateGroupModal();
});

// 새로고침 이벤트 처리
refreshBtn.addEventListener("click", () => {
    if (isGroupLoading) {
        console.log("로딩중");
        return;
    }

    isGroupLoading = true;

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

            user.blockedUsers.map((blockedUser) => {
                blockedUserIds[blockedUser.id] = blockedUser.id;
            });

            blockedUsers = user.blockedUsers.map((blockedUser) => {
                return blockedUser.id;
            });

            console.log("차단유저: ", blockedUsers);

            user.friends.map((friend) => {
                friendIds[friend.id] = friend.id;
            });

            friends = user.friends.map((friend) => {
                return friend.id;
            });

            console.log("친구: ", friends);

            document.querySelector("#profile .discord-user-name").innerHTML =
                `${user.username}`;
            //유저 아이디 저장
            document
                .querySelector("#profile #profile-list")
                .setAttribute("data-id", `${data.userId}`);

            loginBtn.value = "로그아웃";

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

        tr.innerHTML = `
        <td class="group_name"><span>${group.info.name}</span></td>
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
        <div>
                ${["jg", "top", "mid", "adc", "sup"]
                    .map(
                        (pos) =>
                            `<div class="${
                                Enum.PositionClass[pos]
                            }"><img src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/${
                                group.state[pos] && group.state[pos].isActive
                                    ? group.state[pos].userId
                                        ? `${Enum.Position[pos]}`
                                        : `${Enum.Position[pos]}흑`
                                    : "금지흑"
                            }.png" /></div>`,
                    )
                    .join("")}
        </div>
    </td>`;

        tableBody.appendChild(tr);
    }
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

async function createSystemMessage(userId, type) {
    const chatList = document.querySelector(".group_manage_chat_list");

    let userName;
    try {
        const response = await fetch(`/user/${userId}`, {
            method: "GET",
        });
        userName = await response.text();
    } catch (e) {
        console.log(e);
    }

    let message;
    switch (type) {
        case "join":
            message = `${userName} 님이 입장하셨습니다.`;
            break;
        case "leave":
            message = `${userName} 님이 퇴장하셨습니다.`;
    }

    const chatLine = document.createElement("div");
    chatLine.classList.add("chat_line");
    chatLine.innerHTML = `
        <div class="chat system">
            ${message}
        </div>
    `;

    chatList.appendChild(chatLine);
}

document
    .querySelector(".group_manage #updateGroupSetting")
    .addEventListener("click", (e) => {
        const isOwner = checkIsOwner();
        if (!isOwner) {
            alert("그룹장에게만 허가된 기능입니다.");
            return;
        }

        socket.emit("openGroupUpdate", { groupId });
    });

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
    const ownerElement = document.querySelector(
        ".group_manage_header .owner_name",
    );
    const chatList = document.querySelector(".group_manage_chat_list");

    titleElement.innerHTML = "";
    modeElement.innerHTML = "";
    ownerElement.innerHTML = "";
    chatList.innerHTML = "";
}

// 그룹 역할 상태 변경시 업데이트
async function updateSelectPositionState(groupState, users) {
    const positions = ["jg", "top", "mid", "adc", "sup"];

    for (let pos of positions) {
        const target = document.querySelector(
            `.select-position-parent .position-${pos}`,
        );
        let { isActive, userId } = groupState[pos];

        let user;
        if (users) user = users.pop();

        if (!isActive) {
            setSPForbidden(target);
            if (!user) continue;
        }

        if (!userId) {
            if (!user) {
                setSPDisable(target);
                continue;
            } else {
                userId = user;
            }
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
async function updateGroupUpdateState(groupInfo, groupState, aramUsers) {
    const title = document.querySelector(
        ".update-group-modal .group-title-input",
    );
    const mode = document.querySelector(
        ".update-group-modal .group-mode-input",
    );
    const tier = document.querySelector(
        ".update-group-modal .group-tier-input",
    );
    const peopleBox = document.querySelector(
        ".update-group-modal .select-group-box .people-box",
    );
    const people = document.querySelector(
        ".update-group-modal .group-people-input",
    );
    const privateCheckbox = document.querySelector(
        '.update-group-modal .private-box input[type="checkbox"]',
    );
    const password = document.querySelector(
        ".update-group-modal .private-password",
    );

    if (groupInfo !== null) {
        title.value = groupInfo.name;
        mode.value = groupInfo.mode;
        tier.value = groupInfo.tier;
        privateCheckbox.checked = !groupInfo.open;
        password.value = groupInfo.password ? groupInfo.password : "";
    }

    if (groupInfo && groupInfo.mode === "aram") {
        peopleBox.style.display = "flex";
    }
    people.value = groupState.totalUser;

    const positions = ["jg", "top", "mid", "adc", "sup"];

    for (let i = 0; i < positions.length; i++) {
        const position = positions[i];

        // 이미지
        const isActive = groupState[position].isActive;
        const color = isActive ? "" : "흑";
        const positionName =
            groupInfo && groupInfo.mode === "aram"
                ? "금지"
                : Enum.Position[position];
        const positionTarget = document.querySelector(
            `.update-select-position-box .position-${position}`,
        );
        if (isActive) {
            positionTarget.classList.add("isPositionActive");
        } else {
            positionTarget.classList.remove("isPositionActive");
        }
        positionTarget.querySelector(`img`).src =
            `https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/${positionName}${color}.png`;

        // 유저 이름
        const userId = +groupState[position].userId;
        let userName = "";
        if (userId) {
            try {
                const response = await fetch(`/user/${userId}`, {
                    method: "GET",
                });
                userName = await response.text();
                positionTarget.dataset.userId = userId;
                positionTarget.classList.add("positionSelected");
            } catch (e) {
                console.log(e);
            }
        } else {
            positionTarget.dataset.userId = "";
            positionTarget.classList.remove("positionSelected");
        }

        positionTarget.querySelector(".user-name").textContent = userName;
    }

    if (groupInfo && aramUsers && groupInfo.mode === "aram") {
        for (let i = 0; i < aramUsers.length; i++) {
            const position = positions[i];
            const userId = aramUsers[i];

            const positionTarget = document.querySelector(
                `.update-select-position-box .position-${position}`,
            );
            positionTarget.dataset.userId = userId;

            try {
                const response = await fetch(`/user/${userId}`, {
                    method: "GET",
                });
                const userName = await response.text();
                positionTarget.dataset.userId = userId;
                positionTarget.classList.add("positionSelected");
                positionTarget.querySelector(".user-name").textContent =
                    userName;
            } catch (e) {
                console.log(e);
            }
        }
    }
}

// 수정 완료 버튼 클릭 시
document.querySelector("#update-complete").addEventListener("click", () => {
    const updatePosition = {
        mid: false,
        sup: false,
        adc: false,
        top: false,
        jg: false,
    };

    const title = document.querySelector(
        ".update-group-modal .group-title-input",
    ).value;
    const mode = document.querySelector(
        ".update-group-modal .group-mode-input",
    ).value;
    const tier = document.querySelector(
        ".update-group-modal .group-tier-input",
    ).value;
    const people = +document.querySelector(
        ".update-group-modal .group-people-input",
    ).value;

    Object.keys(updatePosition).forEach((position) => {
        const positionElement = document.querySelector(
            `.update-select-position-box .position-${position}`,
        );
        if (positionElement.classList.contains("isPositionActive")) {
            updatePosition[position] = true;
        }
    });

    socket.emit("groupUpdate", {
        groupId,
        name: title,
        tier,
        people: mode === "aram" ? people : null,
        updatePosition,
    });
});

document.querySelectorAll(".update-group-modal .out-btn").forEach((outBtn) => {
    outBtn.addEventListener("click", (e) => {
        const userId = +outBtn.parentElement.dataset.userId;
        const userName =
            outBtn.parentElement.querySelector(".user-name").textContent;
        console.log(userId);
        noneBlockOutModal(userId, userName);
    });
});

document.querySelector(".out-agree-btn").addEventListener("click", (e) => {
    const outBox = document.querySelector(".out-box");
    const userId = +outBox.dataset.id;
    socket.emit("kick", { kickedUserId: userId });
    noneBlockOutModal();
});

document.querySelector(".out-cancel-btn").addEventListener("click", (e) => {
    noneBlockOutModal();
});

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
    const { groupInfo, groupState, users, userId } = data;
    createSystemMessage(userId, "join");
    updateGroupManageState(groupInfo, groupState);
    updateGroupUpdateState(groupInfo, groupState, users ? [...users] : []);
    updateSelectPositionState(groupState, users ? [...users] : []);
});

socket.on("openGroupUpdate", (data) => {
    const { groupInfo, groupState, users } = data;
    updateGroupUpdateState(groupInfo, groupState, users ? [...users] : []);
    document.querySelector("#updateGroupContainer").classList.remove("hidden");
});

socket.on("groupUpdate", (data) => {
    const { groupInfo, groupState, users } = data;
    updateGroupManageState(groupInfo, groupState);
    updateGroupUpdateState(groupInfo, groupState, users ? [...users] : []);
    updateSelectPositionState(groupState, users ? [...users] : []);
    alert("그룹이 수정되었습니다.");
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
    const { groupInfo, groupState, users, userId } = data;
    createSystemMessage(userId, "leave");
    updateGroupManageState(groupInfo, groupState);
    updateSelectPositionState(groupState, users ? [...users] : []);
    updateGroupUpdateState(groupInfo, groupState, users ? [...users] : []);
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
    friendIds[data.friendId] = data.friendId;
    getFriendList(friendIds).then(() => dblclickFriend());
});

friendSocket.on("sendMessage", (data) => {
    socketMessage(data);
});

friendSocket.on("deleteFriend", (data) => {
    friendIds[data.id] = null;
    getFriendList(friendIds).then(() => dblclickFriend());
});

friendSocket.on("blockedUser", (data) => {
    if (data) {
        friendIds[data.deleteId] = null;
    }
    getFriendList(friendIds).then(() => dblclickFriend());
});
