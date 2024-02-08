async function insertGroupRecord(users) {
    const groupRecordList = document.querySelector(
        ".group-list-modal .group-list-box"
    );
    let groupListBox = "";
    for (let userId of users) {
        //discord 유저 id로 디코 이름과 롤 이름 태그 가져오기
        const response = await fetch(`/user/${userId}`, { method: "GET" });
        const groupListName = await response.text();
        const res = await fetch(`/lol/discordUser/${userId}`, {
            method: "GET"
        });
        let groupListUser;
        if (res.status >= 400) {
            groupListUser = {
                profileIconId: 1,
                nameTag: "롤과 연동되지 않은 계정입니다"
            };
        } else {
            groupListUser = await res.json();
        }

        const lolUser = await fetch(`/lol/user/${groupListUser}`, {
            method: "GET"
        }).then((res) => {
            return res.json();
        });

        groupListBox =
            groupListBox +
            `<div class="group-list-info">
                <div class="group-list-icon">
                    <img
                        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/profile_icon/${lolUser.user.profileIconId}.png"
                        alt=""
                    />
                </div>
                <div class="group-list-info-box">
                    <div class="group-list-discord-name">
                    <span class="user_click user"
                       oncontextmenu="showUserClickModal(event)"
                       data-id="${groupListName}">${lolUser.user.gameName}
                   </span>
                   </div>
                    <div>#${lolUser.user.gameTag}</div>
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

document
    .querySelector("#groupListContainer")
    .addEventListener("click", (e) => {
        if (e.target.classList.contains("container")) {
            console.log("");
            hideGroupUserList();
        }
    });
