// 그룹 모달 열기
document.querySelector("#create-group-btn").addEventListener("click", () => {
    openModal("create-group-modal");
});

// 그룹 모달 닫기
document
    .querySelector("#create-group-modal .close-btn")
    .addEventListener("click", () => {
        closeModal("create-group-modal");
    });

// 프로필 모달 열기
document.querySelector("#profile-btn").addEventListener("click", () => {
    openModal("profile-modal");
});

// 프로필 모달 닫기
document
    .querySelector("#profile-modal .close-btn")
    .addEventListener("click", () => {
        closeModal("profile-modal");
    });

// 로그인 API 연동
document
    .querySelector("#login-btn")
    .addEventListener("click", redirectToDiscordAuth());

function openModal(el) {
    document.getElementById(el).style.display = "block";
}

function closeModal(el) {
    document.getElementById(el).style.display = "none";
}

async function redirectToDiscordAuth() {
    try {
        const response = await fetch("/auth/login", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("서버 에러", response.status);
        }

        const data = await response.json();

        window.location.href = data.url;
    } catch (err) {
        console.error(err);
    }
}
