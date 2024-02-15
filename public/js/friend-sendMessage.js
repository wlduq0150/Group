//이름 더블클릭 했을때 채팅창 나오기 + 이름 우클릭으로 모달창 띄우기
function dblclickFriend() {
    const allFriends = document.querySelectorAll(".friend_list .one-friend");
    for (let myFriend of allFriends) {
        let friendName = myFriend.querySelector(".user").innerText;
        if (myFriend.dataset.id == friendIds[myFriend.dataset.id]) {
            myFriend.addEventListener("dblclick", (e) => {
                hideFriendList();
                openSendMessage(friendName, myFriend.dataset.id);
                getSendAccept(myFriend.dataset.id, userId);
            });
            myFriend.addEventListener("contextmenu", (e) => {
                showUserClickModal(e);
            });
        }
    }
}

//대화하기 눌렀을때
async function clickMessageChat(e) {
    const friendId = +document.querySelector(
        "#userClickContainer .user_click_modal",
    ).dataset.id;
    //친구확인
    if (friendId == friendIds[friendId]) {
        const friendName = await findNameById(friendId);
        hideFriendList();
        openSendMessage(friendName, friendId);
        getSendAccept(friendId, userId);
    }
}

//id로 이름 검색
async function findNameById(friendId) {
    const res = await fetch(`/user/${friendId}`);
    return await res.text();
}

//프론트 엔드에서 유저가 작업관리자로 조작한경우
function verifyUserId() {
    const dataUserId = document.querySelector("#profile #profile-list");
    if (userId != dataUserId.dataset.id) {
        alert("로그인한 유저 id와 유저 태그의 id가 다릅니다");
        dataUserId.setAttribute("data-id", `${userId}`);
    }
}
