// notice-modal.js
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("noticeModal");
    const closeBtn = document.querySelector(".close");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const ignoreForeverCheckbox = document.getElementById("ignoreForever");

    // Check local storage if the modal should be displayed
    const showModal = !localStorage.getItem("hideModalForever");

    if (showModal) {
        modal.style.display = "block";
    }

    // Close modal event listener
    closeBtn.addEventListener("click", closeModal);
    closeModalBtn.addEventListener("click", closeModal);

    function closeModal() {
        modal.style.display = "none";
        if (ignoreForeverCheckbox.checked) {
            localStorage.setItem("hideModalForever", true);
        }
    }

    // Click outside of modal to close
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });
});
