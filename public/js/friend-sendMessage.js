function dblclickFriend() {
    const allFriends = document.querySelectorAll(
        ".friend_list .friend_name .user",
    );
    console.log(allFriends[0]);
    for (let myFriend of allFriends) {
        myFriend.addEventListener("dblclick", (e) => {
            const message = prompt("보낼 메세지를 입력해 주세요");
            sendMessage(e.currentTarget.dataset.id, message);
        });
    }
    // console.log(allFriends);
}

function sendMessage(friendId, message) {
    const privateMessage = { friendId, message };
    friendSocket.emit("sendMessage", privateMessage);
}

// for(let friend of allFriends){
//     friend.setAttribute("id")
// }
