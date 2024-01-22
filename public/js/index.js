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
document.querySelector("#login-btn").addEventListener("click", () => {
    window.location.href = "/auth/login";
});

// 로그아웃 API 연동
document.querySelector("#logout-btn").addEventListener("click", async () => {
    try {
        const response = await fetch("/auth/logout", {
            method: "GET",
        });
        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }
        window.location.href = "/html/index.html";
        alert("로그아웃 되었습니다.");
    } catch (err) {
        console.error(err);
    }
});

function openModal(el) {
    document.getElementById(el).style.display = "block";
}

function closeModal(el) {
    document.getElementById(el).style.display = "none";
}
