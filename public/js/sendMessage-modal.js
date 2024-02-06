document
    .querySelector(".sendMessage-parent .back-btn")
    .addEventListener("click", (e) => {
        document.getElementById("sendMessageContainer").classList.add("hidden");
        showFriendList();
        // saveMessage(
        //     userId,
        //     document.querySelector(".sendMessage-parent .discordUser-name")
        //         .dataset.id,
        // );
    });

//모달창 껏을때 메세지 저장
function saveMessage(userId, friendId) {
    fetch("/friend/saveMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userOne: +userId, userTwo: +friendId }),
    });
}

//친구 메세지 열기
async function openSendMessage(friendName, friendId) {
    document.querySelector(".sendMessage-parent .discordUser-name").innerHTML =
        `${friendName}`;
    document
        .querySelector(".sendMessage-parent .discordUser-name")
        .setAttribute("data-id", `${friendId}`);
    document.getElementById("sendMessageContainer").classList.remove("hidden");
}

//메세지 데이터를 배열로 해서 db에서 가져옮
async function getSendAccept(friendId, myId, friendName) {
    const response = await fetch("/friend/setMessageRedis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userOne: +friendId, userTwo: +myId }),
    });
    const messages = await response.json();

    fillMessage(messages);
}

function getRedisMessage(roomId, count) {}

//배열화된 매세지 하나씩 생성
function fillMessage(messages) {
    const messageList = document.querySelector(
        ".sendMessage-parent .sendMessage-list-box",
    );
    messageList.innerHTML = "";
    document
        .querySelector("#sendMessageContainer .discordUser-name")
        .setAttribute("data-roomId", `${messages[0].messageRoomId}`);
    for (let i = 0; i < messages.length; i++) {
        createMessage(messages[i]);
    }
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

        sendMessage(+friendId, messageInput.value);
        messageInput.value = "";
    }
}

//스크롤 가장 밑으로 이동
function downScroll() {
    let scroll = document.querySelector(
        ".sendMessage-parent .sendMessage-list-box ",
    );

    scroll.scrollTop = scroll.scrollHeight;
}

//메세지 소켓으로 보내기
function sendMessage(friendId, message) {
    const sendMessageDto = { friendId, message };
    friendSocket.emit("sendMessage", sendMessageDto);
}

//메세지 소켓에서 받아서 생성하기
function socketMessage(data) {
    createMessage(data);
}

//메세지 생성
function createMessage(data) {
    const messageList = document.querySelector(
        ".sendMessage-parent .sendMessage-list-box",
    );

    const day = data.sendDate.split("T");
    let lastChild = null;
    if (messageList.childNodes.length) {
        lastChild = messageList.lastChild;
    }
    let newMessage = "";
    let tailMessage = "";
    let messageChild = document.createElement("div");
    messageChild.setAttribute("data-day", `${day[0]}`);
    messageList.appendChild(messageChild);
    if (data.senderId == userId) {
        senderName = document.querySelector(".discord-user-name").innerText;
        newMessage = newMessage + `<div class="me" data-id=${data.senderId} >`;
        tailMessage = `
        <div class="one-message">
            <div class="message-time">${day[1].substr(0, 5)}</div>
                <div class="message-text-box">
                    <div class="message-text">${data.message}</div>
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
                        <div class="message-text">${data.message}</div>
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
    } else {
        newMessage =
            newMessage +
            ` <div class="message-day">${day[0]}</div>
`;
    }
    newMessage = newMessage + tailMessage;
    messageChild.innerHTML = newMessage;
    downScroll();
}
