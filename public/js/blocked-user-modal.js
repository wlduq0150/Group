async function getBlockedUser() {
    const blockedUserList = document.querySelector(
        ".blocked-user-modal .blocked-user-list-box",
    );
    const response = await fetch(`/friend/blocked-users`, {
        method: "GET",
    });
    const user = await response.json();
    //차단한 유저가 없을 때
    if (!user) {
        blockedUserList.innerHTML = "";
    }
    console.log(user.data);
    for (let blocked of user.data) {
        let blockedUserBox = document.createElement("div");
        blockedUserBox.setAttribute("class", "blocked-user-box");
        blockedUserBox.setAttribute("id", `${blocked.id}`);
        blockedUserList.appendChild(blockedUserBox);
        blockedUserBox.innerHTML = `
        <div class="blocked-user-info">
            <div class="blocked-user-icon">
                <img
                    src="https://with-lol.s3.ap-northeast-2.amazonaws.com/profile_icon/9.png"
                    alt=""
                />
            </div>
        <div class="blocked-user-info-box">
            <div class="blocked-discord-name">${blocked.username}</div>
            <div>게임이름+태그</div>
        </div>
    </div>`;
    }
}

getBlockedUser();

const hideBlockedUserModal = document.querySelector(
    "#profile .blocked-user-list-btn",
);
//차단목록 띄우기
hideBlockedUserModal.addEventListener("click", (e) => {
    document.getElementById("blockedUserContainer").classList.remove("hidden");
});
