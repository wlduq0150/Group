document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("noticeModal");
    const closeBtn = document.querySelector(".close");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const ignoreForeverCheckbox = document.getElementById("ignoreForever");

    // 로컬 스토리지에서 모달 표시 여부를 확인
    const showModal = !localStorage.getItem("hideModalForever");

    // 모달 보여야하면 보여주기
    if (showModal) {
        modal.style.display = "block";
    }

    // 모달 닫기
    closeBtn.addEventListener("click", closeModal);
    closeModalBtn.addEventListener("click", closeModal);

    function closeModal() {
        modal.style.display = "none"; //모달 숨기기
        if (ignoreForeverCheckbox.checked) {
            localStorage.setItem("hideModalForever", true); // 앞으로 보지 않기
        }
    }

    // iframe 내부 문서에 접근하여 스타일 변경
    const iframeDocument =
        document.querySelector(".modal-iframe").contentWindow.document;
    iframeDocument.body.style.zoom = "200%";
});
