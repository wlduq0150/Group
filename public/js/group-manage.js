let lastWriter = null;

function showGroupManage() {
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
            ${message}
        </div>
    `;

    const writer = document.createElement("div");
    writer.classList.add("chat_writer");
    writer.innerHTML = `
        <span class="user" data-id="${userId}">
            ${name}
        </span>
    `;

    if (whoChat === "other" && lastWriter !== userId) {
        chatList.appendChild(writer);
    }

    chatList.appendChild(chat);
    lastWriter = userId;
}

const positionSelectBtn = document.getElementById("groupPositionSelect");
const updateGroupBtn = document.getElementById("updateGroupSetting");

positionSelectBtn.addEventListener("click", (e) => {
    document
        .getElementById("positionSelectContainer")
        .classList.remove("hidden");
});

updateGroupBtn.addEventListener("click", (e) => {
    document.getElementById("updateGroupContainer").classList.remove("hidden");
});
