//그룹의 참여중이고 창을닫았는데 메세지왔을때 알림
function alarmGroupMessage() {
    const groupContainer = document.querySelector("#groupManageContainer");
    if (groupContainer.classList.contains("hidden")) {
        viewChatImg();
    }
}

function hidenChatImg() {
    if (
        !document
            .querySelector(".chatting_box .chatting-notice-img-btn")
            .classList.contains("hidden")
    ) {
        document
            .querySelector(".chatting_box .chatting-notice-img-btn")
            .classList.add("hidden");
    }
}

function viewChatImg() {
    document
        .querySelector(".chatting_box .chatting-notice-img-btn")
        .classList.remove("hidden");
}

//친구에게 메세지가 왔을때 알림
function alarmFriendMessage(senderId) {
    document.querySelector("#profile .message-alarm").innerHTML = `<img
    onclick="clickAlarmMessage(event)"
    class="on-alarm"
    data-id="${senderId}"
    src="https://with-lol.s3.ap-northeast-2.amazonaws.com/menuIcon/alarmMessage.png"
    alt=""
/>`;
}

//온 메세지 눌렀을때
async function clickAlarmMessage(e) {
    document.querySelector("#profile .message-alarm").innerHTML = `<img
    class="no-alarm"
    src="https://with-lol.s3.ap-northeast-2.amazonaws.com/menuIcon/noMessage.png"
    alt=""
/>`;
    const friendId = e.target.dataset.id;
    const friendName = await findNameById(friendId);
    openSendMessage(friendName, friendId);
    getSendAccept(friendId, userId, friendName);
}

//알림 메세지 보이기
function hideMessageAlarm() {
    document
        .querySelector("#profile .message-alarm")
        .classList.remove("hidden");
}
//알림 메세지 숨기기
function viewMessagAlarm() {
    document.querySelector("#profile .message-alarm").classList.add("hidden");
}
