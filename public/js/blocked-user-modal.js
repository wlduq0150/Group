//차단목록 눌렀을 때 차단목록 생성
async function getBlockedUser(users) {
    const blockedUserList = document.querySelector(
        ".blocked-user-modal .blocked-user-list-box",
    );
    let blockedUserBox = "";
    for (let userId of users) {
        //discord 유저 id로 디코 이름과 롤 이름 태그 가져오기
        const userDetailResponse = await fetch(
            `/user/detail/${userId}`,
        );
        const userDetail = await userDetailResponse.json();
        const avatarHash = userDetail.avatar;
        const discordId = userDetail.discordId;
        const defaultAvatarUrl =
        "https://with-lol.s3.ap-northeast-2.amazonaws.com/profile_icon/0.png";
        const avatarUrl = avatarHash
            ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=256`
            : defaultAvatarUrl;

        const res = await fetch(`/lol/userNameTag/${userId}`, {
            method: "GET",
        });
        let blockedLOlUser;
        if (res.status >= 400) {
            blockedLOlUser = {
                profileIconId: 1,
                nameTag: "롤과 연동되지 않은 계정입니다",
            };
        } else {
            blockedLOlUser = await res.text();
        }
        blockedUserBox =
            blockedUserBox +
            `
        <div class="blocked-user-box" id="${userId}">
        <div class="blocked-user-info">
            <div class="blocked-user-icon">
                <img
                    src="${avatarUrl}"
                    alt=""
                />
            </div>
        <div class="blocked-user-info-box">
            <div class="blocked-discord-name"><span class="user_click user" oncontextmenu="showUserClickModal(event)" data-id="${userDetail.id}">${userDetail.username}</span></div>
            <div>${blockedLOlUser}</div>
        </div>
    </div></div>`;
    }
    blockedUserList.innerHTML = blockedUserBox;
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
