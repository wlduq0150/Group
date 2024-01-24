function showFriendRequest(user) {
    const userId = user.id;
    const discordName = user.username;
    let lolIcon = 1;
    let lolName = "롤 연동 안됨";

    if (user.lolUser) {
        lolIcon = user.lolUser.profileIconId;
        lolName = `${user.lolUser.nameTag}`;
    }

    const friendRequestModal = document.querySelector(
        "#friendRequestContainer .friend_request_modal",
    );

    console.log(friendRequestModal);

    const iconElement = friendRequestModal.querySelector(".sender_img_box img");
    const discordTagElement = friendRequestModal.querySelector(
        ".sender_discord_tag",
    );
    const lolTagElement = friendRequestModal.querySelector(".sender_lol_tag");

    friendRequestModal.dataset.senderId = userId;
    iconElement.src = `https://with-lol.s3.ap-northeast-2.amazonaws.com/profile_icon/${lolIcon}.png`;
    discordTagElement.textContent = discordName;
    lolTagElement.textContent = lolName;

    document
        .querySelector("#friendRequestContainer")
        .classList.remove("hidden");
}

function hideFriendRequest() {
    document.querySelector("#friendRequestContainer").classList.add("hidden");
}

async function acceptFriendRequest() {
    const modal = document.querySelector(".friend_request_modal");
    const senderId = modal.dataset.senderId;

    try {
        const response = await fetch(`/friend/${senderId}/accept`, {
            method: "POST",
        });

        const result = await response.json();

        hideFriendRequest();
        console.log("친구 수락 완료");
    } catch (e) {
        console.log(e);
    }
}

async function rejectFriendRequest() {
    const modal = document.querySelector(".friend_request_modal");
    const senderId = modal.dataset.senderId;

    try {
        const response = await fetch(`/friend/${senderId}/decline`, {
            method: "DELETE",
        });

        const result = await response.json();

        hideFriendRequest();
        console.log("친구 거절 완료");
    } catch (e) {
        console.log(e);
    }
}
