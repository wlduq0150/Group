function showUserClickModal(e) {
    e.preventDefault();
    const target = e.currentTarget;
    const userId = target.dataset.id;
    const rect = target.getBoundingClientRect();

    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;

    const userClickModal = document.querySelector(
        "#userClickContainer .user_click_modal",
    );
    userClickModal.dataset.id = userId;
    userClickModal.style.position = "absolute";
    userClickModal.style.top = (top - 55).toString() + "px";
    userClickModal.style.left = (left + 15).toString() + "px";

    document.querySelector("#userClickContainer").classList.remove("hidden");
}

function showProfile() {
    showProfileModal();
}

async function sendFriendRequest() {
    const userId = document.querySelector(
        "#userClickContainer .user_click_modal",
    ).dataset.id;

    try {
        const response = await fetch(`/friend/${userId}/request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        console.log(data);
    } catch (err) {
        console.log(err);
        alert(err.message);
    }
}

function ban() {}
