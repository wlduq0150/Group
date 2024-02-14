let lastWriter = null;

function showGroupManage() {
    hidenChatImg();
    document.getElementById("groupManageContainer").classList.remove("hidden");
}

function hideGroupManage() {
    document.getElementById("groupManageContainer").classList.add("hidden");
}

function createChatMessage(myId, userId, name, message) {
    const chatList = document.querySelector(".group_manage_chat_list");

    let whoChat;

    if (userId === null) {
        whoChat = "system";
    } else if (myId === userId) {
        whoChat = "mine";
    } else {
        whoChat = "other";
    }

    const chat = document.createElement("div");
    chat.classList.add("chat_line");
    chat.innerHTML = `
        <div class="chat ${whoChat}">
            ${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </div>
    `;

    const writer = document.createElement("div");
    writer.classList.add("chat_writer");
    writer.innerHTML = `
        <span class="user_click user" oncontextmenu="showUserClickModal(event)" data-id="${userId}">
            ${name}
        </span>
    `;

    if (whoChat === "other" && lastWriter !== userId) {
        chatList.appendChild(writer);
    }

    chatList.appendChild(chat);
    chatList.scrollTop = chatList.scrollHeight;
    lastWriter = userId;
}

function checkIsOwner() {
    const myName = document.querySelector(
        "#profile .discord-user-name",
    ).textContent;
    const ownerName = document.querySelector(
        ".group_manage .owner_name",
    ).textContent;

    if (myName === ownerName) return true;

    return false;
}

async function moveDiscord() {
    try {
        if (!groupId) {
            alert("그룹이 존재하지 않습니다.");
            return;
        }

        const response = await fetch(`/discord/join-voice/${groupId}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 403) {
                alert(data.message);
            }
            if (response.status === 404) {
                alert("대기실에 입장해주세요.");
            }

            return;
        }

        alert("음성 채널에 참여했습니다.");
    } catch (err) {
        alert(err.message);
    }
}

const positionSelectBtn = document.getElementById("groupPositionSelect");
// const updateGroupBtn = document.getElementById("updateGroupSetting");
const clickModalOutSide = document.getElementById("groupManageContainer");

positionSelectBtn.addEventListener("click", (e) => {
    document
        .getElementById("positionSelectContainer")
        .classList.remove("hidden");
});

// updateGroupBtn.addEventListener("click", (e) => {
//     document.getElementById("updateGroupContainer").classList.remove("hidden");
// });

//모달창 밖 눌렀을 때
clickModalOutSide.addEventListener("click", (e) => {
    if (e.target.id == "groupManageContainer") {
        hideGroupManage();
        hideSelectPosition();
        hideUpdateGroup();
    }
});
