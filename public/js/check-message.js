//그룹의 참여중이고 창을닫았는데 메세지왔을때 알림
function alarmGroupMessage() {
    const groupContainer = document.querySelector("#groupManageContainer");
    console.log(groupContainer.className);
    if (groupContainer.className == "hidden") {
        const chatImg = document.querySelector(
            ".chatting_box .chatting-notice-img-btn",
        );
        toggleChatImg();
        chatImg.addEventListener("click", (e) => {
            toggleChatImg();
            showGroupManage();
        });
    }
}

//친구에게 메세지가 왔을때 알림
function alarmFriendMessage() {}

function toggleChatImg() {
    document
        .querySelector(".chatting_box .chatting-notice-img-btn")
        .classList.toggle("hidden");
}
