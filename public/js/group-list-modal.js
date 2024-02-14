async function insertGroupRecord(users) {
    const groupRecordList = document.querySelector(
        ".group-list-modal .group-list-box",
    );
    let groupListBox = "";
    for (let userId of users) {
        //discord 유저 id로 디코 이름과 롤 이름 태그 가져오기
        const userDetail = await (await fetch(`/user/detail/${userId}`)).json();

        const avatarHash = userDetail.avatar;
        const discordId = userDetail.discordId;
        const defaultAvatarUrl =
            "https://with-lol.s3.ap-northeast-2.amazonaws.com/profile_icon/0.png";
        const avatarUrl = avatarHash
            ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=256`
            : defaultAvatarUrl;
        
        groupListBox =
            groupListBox +
            `<div class="group-list-info">
                <div class="group-list-icon">
                    <img
                        src="${avatarUrl}"
                        alt=""
                    />
                </div>
                <div class="group-list-info-box"
                data-id="${userId}"
                oncontextmenu="showUserClickModal(event)">
                    <div class="group-list-discord-name">
                    <span class="user_click user">${userDetail.username}
                   </span>
                   </div>
                    <div>${
                        userDetail?.lolUser?.nameTag
                            ? `${userDetail.lolUser.nameTag}`
                            : "롤 유저 정보 없음"
                    }</div>
                </div>
            </div>`;
    }
    groupRecordList.innerHTML = groupListBox;
}

function showGroupUserList() {
    console.log(`최근 그룹 유저 ID ${groupRecordUsers}`);
    insertGroupRecord(groupRecordUsers);
    document.querySelector("#groupListContainer").classList.remove("hidden");
}

function hideGroupUserList() {
    document.querySelector("#groupListContainer").classList.add("hidden");
}

document.querySelector("#groupListContainer").addEventListener("click", (e) => {
    if (e.target.classList.contains("container")) {
        console.log("");
        hideGroupUserList();
    }
});
