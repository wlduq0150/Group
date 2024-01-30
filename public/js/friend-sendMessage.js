//이름 더블클릭 했을때 채팅창 나오기 + 이름 우클릭으로 모달창 띄우기
function dblclickFriend() {
    const allFriends = document.querySelectorAll(
        ".friend_list .friend_name .user",
    );
    for (let myFriend of allFriends) {
        myFriend.addEventListener("dblclick", (e) => {
            openSendMessage(e.target.innerText);
            getSendAccept(myFriend.dataset.id, userId, e.target.innerText);
        });
        myFriend.addEventListener("contextmenu", (e) => {
            showUserClickModal(e);
        });
    }
}
