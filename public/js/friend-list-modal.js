const friendRequestButton = document.querySelector("#friend_request");
friendRequestButton.addEventListener("change", function () {
    getFriendRequestList();
});

const friendButton = document.querySelector("#friends");
friendButton.addEventListener("change", function () {
    getFriendList(friends);
});

async function getFriendList(userIds) {
    const friendListContainer = document.querySelector(
        ".friend_content_wrapper .friend_list",
    );

    friendListContainer.classList.remove("hidden");
    document
        .querySelector(".friend_content_wrapper .friend_request_list")
        .classList.add("hidden");

    while (friendListContainer.firstChild) {
        friendListContainer.removeChild(friendListContainer.firstChild);
    }

    friendListContainer.classList.remove("hidden");
    document
        .querySelector(".friend_content_wrapper .friend_request_list")
        .classList.add("hidden");

    for (const userId of userIds) {
        const userNameResponse = await fetch(`/user/${userId}`);
        const userDetailResponse = await fetch(`/user/detail/${userId}`);

        const userName = await userNameResponse.text();
        const userDetail = await userDetailResponse.text();

        const userDiv = document.createElement("div");
        const innerDiv1 = document.createElement("div");
        const imgDiv = document.createElement("img");

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("friend_name");
        const spanWrapDiv = document.createElement("div");
        const span = document.createElement("span");
        span.textContent = userName;
        span.classList.add("user");
        span.dataset.id = userId;
        spanWrapDiv.appendChild(span);
        nameDiv.appendChild(spanWrapDiv);

        const detailDiv = document.createElement("div");
        detailDiv.textContent = userDetail.lolUser
            ? userDetail.lolUser
            : "롤 유저 정보 없음";
        nameDiv.appendChild(detailDiv);

        const onlineDiv = document.createElement("div");
        const circleDiv = document.createElement("div");
        onlineDiv.classList.add("friend_online");
        circleDiv.classList.add("circle");
        onlineDiv.appendChild(circleDiv);

        imgDiv.setAttribute(
            "src",
            "https://with-lol.s3.ap-northeast-2.amazonaws.com/profile_icon/0.png",
        );
        imgDiv.setAttribute("alt", "");

        innerDiv1.appendChild(imgDiv);
        innerDiv1.appendChild(nameDiv);
        innerDiv1.appendChild(onlineDiv);
        userDiv.appendChild(innerDiv1);

        friendListContainer.appendChild(userDiv);
    }
}

async function getFriendRequestList() {
    const friendRequestListContainer = document.querySelector(
        ".friend_content_wrapper .friend_request_list",
    );

    friendRequestListContainer.classList.remove("hidden");
    document
        .querySelector(".friend_content_wrapper .friend_list")
        .classList.add("hidden");

    while (friendRequestListContainer.firstChild) {
        friendRequestListContainer.removeChild(
            friendRequestListContainer.firstChild,
        );
    }

    const response = await fetch("/friend/friend-requests");
    const data = await response.json();
    console.log(data);

    for (const friendRequest of data.data) {
        const friendRequestDiv = document.createElement("div");

        const innerDiv1 = document.createElement("div");
        const imgDiv = document.createElement("div");
        const img = document.createElement("img");
        img.setAttribute(
            "src",
            "https://with-lol.s3.ap-northeast-2.amazonaws.com/profile_icon/0.png",
        );
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
            ? friendRequest.lolUser
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
    getFriendList(friends);
    document.querySelector("#friendListContanier").classList.remove("hidden");
}

function hideFriendList() {
    document.querySelector("#friendListContanier").classList.add("hidden");
}

document
    .querySelector("#friendListContanier")
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
