document.addEventListener("DOMContentLoaded", function () {
    const noticeModal = document.getElementById("noticeModalContainer");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const ignoreForeverCheckbox = document.getElementById("ignoreForever");

    closeModalBtn.addEventListener("click", function () {
        closeModal();
    });

    if (localStorage.getItem("ignoreForever")) {
        noticeModal.style.display = "none";
    }

    ignoreForeverCheckbox.addEventListener("change", function () {
        if (this.checked) {
            localStorage.setItem("ignoreForever", "true");
        } else {
            localStorage.removeItem("ignoreForever");
        }
    });

    function closeModal() {
        if (ignoreForeverCheckbox.checked) {
            localStorage.setItem("ignoreForever", "true");
        }
        noticeModal.style.display = "none";
    }
});
