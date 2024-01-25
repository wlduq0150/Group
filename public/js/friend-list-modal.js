function getFriendList(users) {
    // friend_list 클래스를 가진 요소를 선택합니다.
    const friendListContainer = document.querySelector(
        ".friend_content_wrapper .friend_list",
    );

    friendListContainer.innerHTML = "";

    users.forEach((user) => {
        const userDiv = document.createElement("div");
        const innerDiv1 = document.createElement("div");
        const imgDiv = document.createElement("div");
        const nameDiv = document.createElement("div");
        const onlineDiv = document.createElement("div");
        const circleDiv = document.createElement("div");

        const img = document.createElement("img");
        img.setAttribute(
            "src",
            "https://with-lol.s3.ap-northeast-2.amazonaws.com/profile_icon/0.png",
        );
        img.setAttribute("alt", "");

        const span = document.createElement("span");
        span.textContent = `${user.name}#${user.id}`;
        span.classList.add("user");
        span.dataset.id = user.id;

        userDiv.classList.add("friend_name");
        onlineDiv.classList.add("friend_online");
        circleDiv.classList.add("circle");

        imgDiv.appendChild(img);
        innerDiv1.appendChild(imgDiv);
        innerDiv1.appendChild(nameDiv);
        innerDiv1.appendChild(onlineDiv);
        nameDiv.appendChild(span);
        onlineDiv.appendChild(circleDiv);
        userDiv.appendChild(innerDiv1);
        friendListContainer.appendChild(userDiv);
    });
}

// 롤 유저 정보를 불러오는데 없으면 롤 유저 정보 없음 으로 대체
// 디스코드 태그 대신 닉네임만

async function showFriendList() {
    getFriendList(friends);
    document.querySelector("#friendListContanier").classList.remove("hidden");
}

async function showFriendList() {
    getFriendList(friends);
    document.querySelector("#friendListContanier").classList.remove("hidden");
}

function hideFriendList() {
    document.querySelector("#friendListContanier").classList.remove("hidden");
}
