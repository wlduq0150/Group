const profileOpenButton = document.getElementById("profileOpenButton");
const profileCloseButton = document.getElementById("profileCloseButton");
const profile = document.getElementById("profileContainer");

profileOpenButton.addEventListener("click", () => {
    profile.classList.remove("hidden");
});

profileCloseButton.addEventListener("click", () => {
    profile.classList.add("hidden");
});

const groupOpenButton = document.getElementById("groupOpenButton");
const groupCloseButton = document.getElementById("groupCloseButton");
const group = document.getElementById("groupContainer");

groupOpenButton.addEventListener("click", () => {
    group.classList.remove("hidden");
});

groupCloseButton.addEventListener("click", () => {
    group.classList.add("hidden");
});

// 외부 영역 클릭 시 모달 닫기
window.addEventListener("click", (event) => {
    if (event.target === profile) {
        profile.classList.add("hidden");
    }
});

// 외부 영역 클릭 시 모달 닫기
window.addEventListener("click", (event) => {
    if (event.target === group) {
        group.classList.add("hidden");
    }
});
