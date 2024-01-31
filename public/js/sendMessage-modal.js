clickBackBtn = document
    .querySelector(".sendMessage-parent .back-btn")
    .addEventListener("click", (e) => {
        document.getElementById("sendMessageContainer").classList.add("hidden");
    });

//친구 메세지 열기
async function openSendMessage(friendName) {
    document.querySelector(".sendMessage-parent .discordUser-name").innerHTML =
        `${friendName}`;
    document.getElementById("sendMessageContainer").classList.remove("hidden");
}

//메세지 생성 모달
async function getSendAccept(friendId, myId, friendName) {
    const response = await fetch("/friend/messageRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userOne: +friendId, userTwo: +myId }),
    });
    const messages = await response.json();

    fillMessage(messages, friendName);
}

//매세지 생성
function fillMessage(messages) {
    const messageList = document.querySelector(
        ".sendMessage-parent .sendMessage-list-box",
    );
    messageList.innerHTML = "";
    for (let i = 0; i < messages.sendMessage.length; i++) {
        createMessage(messages.sendMessage[i]);
    }
}

//엔터 눌렀을 때
function enterkey() {
    if (window.event.keyCode == 13) {
        let messageValue = document.querySelector(
            ".sendMessage-parent .sendMessage-input",
        ).value;
        const friendId = document.querySelector(".sendMessage-parent .friend")
            .dataset.id;
        sendMessage(friendId, messageValue);
        messageValue = "";
    }
}

//메세지 소켓으로 보내기
function sendMessage(friendId, message) {
    const privateMessage = { friendId, message };
    friendSocket.emit("sendMessage", privateMessage);
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
    let senderName;
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
            day[1].substr(0, 5)
        ) {
            lastChild.querySelector(".message-time").innerHTML = "";
        } else {
            newMessage =
                newMessage + `<div class="discord-name">${senderName}</div>`;
        }
    } else {
        newMessage =
            newMessage +
            ` <div class="message-day">${day[0]}</div>
        <div class="discord-name">${senderName}</div>`;
    }
    newMessage = newMessage + tailMessage;
    messageChild.innerHTML = newMessage;
}
