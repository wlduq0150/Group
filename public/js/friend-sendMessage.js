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
