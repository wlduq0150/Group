function showUserClickModal(e) {
    e.preventDefault();
    const target = e.currentTarget;
    const targetUserId = +target.dataset.id;
    const rect = target.getBoundingClientRect();

    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;

    const userClickModal = document.querySelector(
        "#userClickContainer .user_click_modal"
    );
    userClickModal.dataset.id = targetUserId;
    userClickModal.style.position = "absolute";
    userClickModal.style.top = (top - 55).toString() + "px";
    userClickModal.style.left = (left + 15).toString() + "px";

    const attrList = ["profile"];
    const isMe = userId === targetUserId;

    if (isMe) {
        attrList.push("friend_list", "blocked_list", "group_list");
    }

    if (!isMe) {
        if (friends.includes(targetUserId)) {
            attrList.push("delete_friend");
        } else {
            attrList.push("send_friend_request");
        }

        if (blockedUsers.includes(targetUserId)) {
            attrList.push("unblock");
        } else {
            attrList.push("block");
        }

        attrList.push("report", "recommend");
    }

    for (let attr of attrList) {
        userClickModal.querySelector(`.${attr}`).classList.remove("hidden");
    }

    document.querySelector("#userClickContainer").classList.remove("hidden");
}

function showProfile() {
    const discordUserId = document.querySelector(
        "#userClickContainer .user_click_modal"
    ).dataset.id;
    openProfile(discordUserId);
}

async function sendFriendRequest() {
    const userId = +document.querySelector(
        "#userClickContainer .user_click_modal"
    ).dataset.id;

    try {
        const response = await fetch(`/friend/${userId}/request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
    } catch (err) {
        console.log(err);
        alert(err.message);
    }
}

async function deleteFriend() {
    const userId = +document.querySelector(
        "#userClickContainer .user_click_modal"
    ).dataset.id;

    try {
        const response = await fetch(`/friend/${userId}/delete`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        friends = friends.filter((friend) => friend !== userId);
    } catch (err) {
        console.log(err);
        alert(err.message);
    }
}

async function blockUser() {
    const userId = +document.querySelector(
        "#userClickContainer .user_click_modal"
    ).dataset.id;

    try {
        const response = await fetch(`/friend/${userId}/block`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        blockedUsers.push(userId);
    } catch (err) {
        console.log(err);
        alert(err.message);
    }
}

async function unblockUser() {
    const userId = +document.querySelector(
        "#userClickContainer .user_click_modal"
    ).dataset.id;

    try {
        const response = await fetch(`/friend/${userId}/unblock`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        blockedUsers = blockedUsers.filter(
            (blockedUser) => blockedUser !== userId
        );
    } catch (err) {
        console.log(err);
        alert(err.message);
    }
}
