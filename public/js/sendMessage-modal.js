//뒤로가기
let isFriendMessageLoading = false;
document
    .querySelector(".sendMessage-parent .back-btn")
    .addEventListener("click", (e) => {
        document.getElementById("sendMessageContainer").classList.add("hidden");
        refreshRoom();
        showFriendList();
    });

//친구 메세지 열기
async function openSendMessage(friendName, friendId) {
    const messageAlarm = document.querySelector("#profile .message-alarm");

    if (
        messageAlarm.firstChild.className == "on-alarm" &&
        messageAlarm.firstChild.dataset.id == friendId
    ) {
        noAlarmMessage();
    }
    isFriendMessageLoading = true;
    document.querySelector(".sendMessage-parent .discordUser-name").innerHTML =
        `${friendName}`;
    document
        .querySelector(".sendMessage-parent .discordUser-name")
        .setAttribute("data-id", `${friendId}`);
    document.getElementById("sendMessageContainer").classList.remove("hidden");
}

//메세지 데이터를 배열로 해서 db에서 가져옮
async function getSendAccept(friendId, myId) {
    const response = await fetch("/friend/setMessageRedis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userOne: +friendId, userTwo: +myId }),
    });
    const messages = await response.json();

    fillMessage(messages);
}

//배열화된 매세지 하나씩 생성
async function fillMessage(messages) {
    const messageList = document.querySelector(
        ".sendMessage-parent .sendMessage-list-box",
    );
    let roomId;
    if (!messages.length) {
        roomId = messages.id;

        messageList.setAttribute("data-count", `0`);
    } else {
        roomId = messages[0].messageRoomId;
    }

    document
        .querySelector("#sendMessageContainer .discordUser-name")
        .setAttribute("data-room_id", `${roomId}`);
    let start = messages.length - 30 <= 0 ? 0 : messages.length - 30;
    messageList.setAttribute("data-count", `${start}`);
    for (let i = start; i < messages.length; i++) {
        messageList.appendChild(createMessage(messages[i]));
    }
    downScroll();
}

//기존 메세지 창 초기화
function refreshRoom() {
    document.querySelector(
        ".sendMessage-parent .sendMessage-list-box",
    ).innerHTML = "";
}

//엔터 눌렀을 때
function enterkey() {
    if (window.event.keyCode == 13) {
        let messageInput = document.querySelector(
            ".sendMessage-parent .sendMessage-input",
        );
        const friendId = document.querySelector(
            ".sendMessage-parent .discordUser-name",
        ).dataset.id;
        const blankPattern = /^\s+|\s+$/g;
        if (
            messageInput.value != "" &&
            !messageInput.value.replace(blankPattern, "") == ""
        ) {
            sendMessage(+friendId, messageInput.value);
            messageInput.value = "";
        }
    }
}

//스크롤 가장 밑으로 이동
function downScroll() {
    let scroll = document.querySelector(
        ".sendMessage-parent .sendMessage-list-box ",
    );

    scroll.scrollTop = scroll.scrollHeight;
    isFriendMessageLoading = false;
}

//메세지 소켓으로 보내기
function sendMessage(friendId, message) {
    const sendMessageDto = { friendId, message };
    friendSocket.emit("sendMessage", sendMessageDto);
}

//메세지 소켓에서 받아서 생성하기
function socketMessage(data) {
    document
        .querySelector(".sendMessage-parent .sendMessage-list-box")
        .appendChild(createMessage(data));
    downScroll();
}

//메세지 생성
function createMessage(data, lastChild) {
    if (data == null) {
        return;
    }
    const messageList = document.querySelector(
        ".sendMessage-parent .sendMessage-list-box",
    );

    const day = data.sendDate.split("T");
    if (lastChild == null) {
        if (messageList.childNodes.length) {
            lastChild = messageList.lastChild;
        }
    }

    let newMessage = "";
    let tailMessage = "";
    let messageChild = document.createElement("div");
    messageChild.setAttribute("data-day", `${day[0]}`);

    if (data.senderId == userId) {
        senderName = document.querySelector(".discord-user-name").innerText;
        newMessage = newMessage + `<div class="me" data-id=${data.senderId} >`;
        tailMessage = `
        <div class="one-message">
            <div class="message-time">${day[1].substr(0, 5)}</div>
                <div class="message-text-box">
                    <div class="message-text">${data.message
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")}</div>
                    </div>
                </div>
            </div>
        </div>
        `;
    } else {
        senderName = document.querySelector(
            ".sendMessage-parent .discordUser-name",
        ).innerText;
        newMessage =
            newMessage +
            `<div class="friend" data-id=${data.senderId} data-day=${day[0]}>`;

        tailMessage = `
            <div class="one-message">
                    <div class="message-text-box">
                        <div class="message-text">${data.message
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")}</div>
                    </div>
                    <div class="message-time">${day[1].substr(0, 5)}</div>
                </div>
            </div>
        </div>`;
    }
    if (lastChild != null && lastChild.dataset.day == day[0]) {
        if (
            lastChild.querySelector(".message-time").innerText ==
                day[1].substr(0, 5) &&
            lastChild.childNodes[0].dataset.id == data.senderId
        ) {
            lastChild.querySelector(".message-time").innerHTML = "";
        } else {
        }
        newMessage = newMessage + ` <div class="message-day"></div>`;
    } else {
        newMessage =
            newMessage +
            ` <div class="message-day">${day[0]}</div>
`;
    }
    newMessage = newMessage + tailMessage;
    messageChild.innerHTML = newMessage;
    return messageChild;
}

//스크롤을 가장위로 올렸을 때
const messageCount = document.querySelector(
    ".sendMessage-parent .sendMessage-list-box",
);

messageCount.addEventListener("scroll", (e) => {
    if (isFriendMessageLoading) {
        console.log("채팅로딩중");
        return;
    }
    const roomId = document.querySelector(
        ".sendMessage-parent .discordUser-name",
    ).dataset.room_id;
    let count = messageCount.dataset.count;
    const oldScrollHeight = e.target.scrollHeight;
    if (count > 0 && e.target.scrollTop == 0) {
        fetch(`/friend/getRedisRoom/${roomId}`, { method: "GET" })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                const parent = document.querySelector(
                    ".sendMessage-parent .sendMessage-list-box",
                );

                const first = parent.firstElementChild;
                let lastChild = first;
                const start = count - 30 <= 0 ? 0 : count - 30;
                for (let i = start; i < count; i++) {
                    const oldMessage = createMessage(data[i], lastChild);
                    parent.insertBefore(oldMessage, first);
                    lastChild = oldMessage;
                }
                if (first.dataset.day == lastChild.dataset.day) {
                    first.querySelector(".message-day").innerHTML = "";
                    if (
                        first.querySelector(".message-time").innerText ==
                        lastChild.querySelector(".message-time").innerText
                    ) {
                        lastChild.querySelector(".message-time").innerHTML = "";
                    }
                }

                e.target.scrollTop = e.target.scrollHeight - oldScrollHeight;
                messageCount.setAttribute("data-count", `${start}`);
                return;
            });
    }
});

function hideSendMessage() {
    document.querySelector("#sendMessageContainer").classList.add("hidden");
}

document
    .querySelector("#sendMessageContainer")
    .addEventListener("click", (e) => {
        if (e.target.classList.contains("container")) {
            hideSendMessage();
        }
    });
