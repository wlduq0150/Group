//이름 더블클릭 했을때 채팅창 나오기 + 이름 우클릭으로 모달창 띄우기
function dblclickFriend() {
    const allFriends = document.querySelectorAll(".friend_list .one-friend");
    for (let myFriend of allFriends) {
        const friendName = myFriend.querySelector(".user").innerText;
        myFriend.addEventListener("dblclick", (e) => {
            hideFriendList();
            openSendMessage(friendName, myFriend.dataset.id);
            getSendAccept(myFriend.dataset.id, userId, friendName);
        });
        myFriend.addEventListener("contextmenu", (e) => {
            showUserClickModal(e);
        });
    }
}

//귓속말 눌렀을때
async function clickMessageChat() {
    const friendId = +document.querySelector(
        "#userClickContainer .user_click_modal",
    ).dataset.id;
    //친구확인
    if (friendId == friendIds[friendId]) {
        const friendName = await findNameById(friendId);
        hideFriendList();
        openSendMessage(friendName, friendId);
        getSendAccept(friendId, userId, friendName);
    }
}

//id로 이름 검색
async function findNameById(friendId) {
    const res = await fetch(`/user/${friendId}`);
    return await res.text();
}
