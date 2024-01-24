const friendsContainer = document.querySelector(".friend_list");
const friendRequestContainer = document.querySelector(".friend_request_list");
const radios = document.querySelectorAll("input[name='friend_menu']");

radios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
        const current = e.currentTarget;
        if (current.value === "friends") {
            friendRequestContainer.classList.add("hidden");
            friendsContainer.classList.remove("hidden");
        } else {
            friendsContainer.classList.add("hidden");
            friendRequestContainer.classList.remove("hidden");
        }
    });
});