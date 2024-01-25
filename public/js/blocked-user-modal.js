async function getBlockedUser(users) {
    const blockedUserList = document.querySelector(
        ".blocked-user-modal .blocked-user-list-box",
    );
    for (let blocked of users) {
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

async function showBlockedUserList() {
    getBlockedUser(blockedUsers);
    document.querySelector("#blockedUserContainer").classList.remove("hidden");
}

function hideBlockedUserList() {
    document.querySelector("#blockedUserContainer").classList.add("hidden");
}

document
    .querySelector("#blockedUserContainer")
    .addEventListener("click", (e) => {
        if (e.target.classList.contains("container")) {
            hideBlockedUserList();
        }
    });
