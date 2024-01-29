function dblclickFriend() {
    const allFriends = document.querySelectorAll(".friend_list .user");
    for (let myFriend of allFriends) {
        myFriend.addEventListener("dblclick", (e) => {
            const message = prompt("보낼 메세지를 입력해 주세요");
            sendMessage(e.currentTarget.dataset.id, message);
        });
    }
    // console.log(allFriends);
}

function sendMessage(frinedId, message) {
    const privateMessage = { frinedId, message };
    friendSocket.emit("sendMessage", privateMessage);
}

// for(let friend of allFriends){
//     friend.setAttribute("id")
// }
