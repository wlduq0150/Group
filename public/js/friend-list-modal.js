let isFriendLoading = false;
const friendRequestButton = document.querySelector("#friend_request");
friendRequestButton.addEventListener("change", function () {
    toggleFriend();
    getFriendRequestList();
});

const friendButton = document.querySelector("#friends");
friendButton.addEventListener("change", function () {
    toggleFriend();
    getFriendList(friendIds).then(() => dblclickFriend());
});

async function getFriendList(userIds) {
    if (isFriendLoading) {
        console.log("로딩중");
        return;
    }
    isFriendLoading = true;
    const friendListContainer = document.querySelector(
        ".friend_content_wrapper .friend_list",
    );

    while (friendListContainer.firstChild) {
        friendListContainer.removeChild(friendListContainer.firstChild);
    }

    for (const userId of userIds) {
        if (userId) {
            //const userNameResponse = await fetch(`/user/${userId}`);
            const userDetailResponse = await fetch(`/user/UserNLol/${userId}`);

            //const userName = await userNameResponse.text();
            const userDetail = await userDetailResponse.json();

            //console.log(userDetail);

            const userDiv = document.createElement("div");
            const innerDiv1 = document.createElement("div");
            const imgDiv = document.createElement("img");

            const nameDiv = document.createElement("div");
            nameDiv.classList.add("friend_name");
            const spanWrapDiv = document.createElement("div");
            const span = document.createElement("span");
            span.textContent = userDetail.username;
            span.classList.add("user");
            span.dataset.id = userId;
            spanWrapDiv.appendChild(span);
            nameDiv.appendChild(spanWrapDiv);

            const detailDiv = document.createElement("div");
            detailDiv.textContent = userDetail.lolUser
                ? userDetail.lolUser.nameTag
                : "롤 유저 정보 없음";
            nameDiv.appendChild(detailDiv);

            const onlineDiv = document.createElement("div");
            const circleDiv = document.createElement("div");
            onlineDiv.classList.add("friend_online");
            circleDiv.classList.add("circle");
            onlineDiv.appendChild(circleDiv);

            const avatarHash = userDetail.avatar;
            const discordId = userDetail.discordId;
            const defaultAvatarUrl =
                "https://with-lol.s3.ap-northeast-2.amazonaws.com/profile_icon/0.png";
            const avatarUrl = avatarHash
                ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=256`
                : defaultAvatarUrl;

            imgDiv.setAttribute("src", avatarUrl);
            imgDiv.setAttribute("alt", userDetail.username);

            innerDiv1.appendChild(imgDiv);
            innerDiv1.appendChild(nameDiv);
            innerDiv1.appendChild(onlineDiv);
            userDiv.appendChild(innerDiv1);

            innerDiv1.setAttribute("class", "one-friend");
            innerDiv1.dataset.id = userId;

            friendListContainer.appendChild(userDiv);
        }
    }
    isFriendLoading = false;
}

async function getFriendRequestList() {
    const friendRequestListContainer = document.querySelector(
        ".friend_content_wrapper .friend_request_list",
    );

    // friendRequestListContainer.classList.remove("hidden");
    // document
    //     .querySelector(".friend_content_wrapper .friend_list")
    //     .classList.add("hidden");

    while (friendRequestListContainer.firstChild) {
        friendRequestListContainer.removeChild(
            friendRequestListContainer.firstChild,
        );
    }

    const response = await fetch("/friend/friend-requests");
    const data = await response.json();

    for (const friendRequest of data.data) {
        const userDetailResponse = await fetch(
            `/user/detail/${friendRequest.id}`,
        );

        const userDetail = await userDetailResponse.json();

        const friendRequestDiv = document.createElement("div");

        const innerDiv1 = document.createElement("div");
        const imgDiv = document.createElement("div");

        const avatarHash = userDetail.avatar;
        const discordId = userDetail.discordId;
        const defaultAvatarUrl =
            "https://with-lol.s3.ap-northeast-2.amazonaws.com/profile_icon/0.png";
        const avatarUrl = avatarHash
            ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=256`
            : defaultAvatarUrl;

        const img = document.createElement("img");
        img.setAttribute("src", avatarUrl);
        img.setAttribute("alt", "");
        imgDiv.appendChild(img);

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("friend_name");
        const spanWrapDiv = document.createElement("div");
        const span = document.createElement("span");
        span.textContent = friendRequest.discordName;
        span.classList.add("user");
        span.dataset.id = friendRequest.id;
        spanWrapDiv.appendChild(span);
        nameDiv.appendChild(spanWrapDiv);

        const detailDiv = document.createElement("div");
        detailDiv.textContent = friendRequest.lolUser
            ? friendRequest.lolUser.nameTag
            : "롤 유저 정보 없음";
        nameDiv.appendChild(detailDiv);

        innerDiv1.appendChild(imgDiv);
        innerDiv1.appendChild(nameDiv);

        const buttonDiv = document.createElement("div");
        buttonDiv.classList.add("friend_request_button");

        const acceptButton = document.createElement("div");
        acceptButton.classList.add("accept_btn");
        acceptButton.textContent = "수락";
        acceptButton.addEventListener("click", async () => {
            await acceptFriendRequestInList(friendRequest.id, friendRequestDiv);
        });

        const denyButton = document.createElement("div");
        denyButton.classList.add("deny_btn");
        denyButton.textContent = "거절";
        denyButton.addEventListener("click", async () => {
            await rejectFriendRequestInList(friendRequest.id, friendRequestDiv);
        });

        buttonDiv.appendChild(acceptButton);
        buttonDiv.appendChild(denyButton);

        friendRequestDiv.appendChild(innerDiv1);
        friendRequestDiv.appendChild(buttonDiv);

        friendRequestListContainer.appendChild(friendRequestDiv);
    }
}

async function showFriendList() {
    getFriendList(friendIds).then(() => {
        dblclickFriend();
    });
    document.querySelector("#friendListContainer").classList.remove("hidden");
}

function hideFriendList() {
    document.querySelector("#friendListContainer").classList.add("hidden");
}

document
    .querySelector("#friendListContainer")
    .addEventListener("click", (e) => {
        if (e.target.classList.contains("container")) {
            hideFriendList();
        }
    });

async function acceptFriendRequestInList(senderId, friendRequestDiv) {
    try {
        await fetch(`/friend/${senderId}/accept`, {
            method: "POST",
        });

        friendRequestDiv.remove(); // 친구 요청 항목 삭제
        console.log("친구 수락 완료");
    } catch (e) {
        console.log(e);
    }
}

async function rejectFriendRequestInList(senderId, friendRequestDiv) {
    try {
        await fetch(`/friend/${senderId}/decline`, {
            method: "DELETE",
        });

        friendRequestDiv.remove(); // 친구 요청 항목 삭제
        console.log("친구 거절 완료");
    } catch (e) {
        console.log(e);
    }
}

function toggleFriend() {
    document
        .querySelector(".friend_content_wrapper .friend_list")
        .classList.toggle("hidden");
    document
        .querySelector(".friend_content_wrapper .friend_request_list")
        .classList.toggle("hidden");
}
