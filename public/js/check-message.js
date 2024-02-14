//그룹의 참여중이고 창을닫았는데 메세지왔을때 알림
function alarmGroupMessage() {
    const groupContainer = document.querySelector("#groupManageContainer");
    if (groupContainer.classList.contains("hidden")) {
        viewChatImg();
        // hidenChatImg();
        // showGroupManage();
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
function alarmFriendMessage() {}
