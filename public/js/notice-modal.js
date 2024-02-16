const noticeModalContainer = document.querySelector("#noticeModalContainer");
document.getElementById("closeModalBtn").addEventListener("click", (e) => {
    noticeModalContainer.classList.add("hidden");
    console.log(noticeModalContainer.querySelector("#ignoreForever"));
});
