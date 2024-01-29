document.querySelector(".create-group-mode").addEventListener("change", (e) => {
    const mode = e.currentTarget.value;

    const peopleBox = document.querySelector(".create-group-modal .people-box");

    if (mode === "aram") {
        peopleBox.style.display = "flex";
        changeAllForbidden();
    } else {
        peopleBox.style.display = "none";
        changeAllInit();
    }
});

function changeAllForbidden() {
    const selectPositionBox = document.querySelector(
        ".create-group-modal .select-position-box",
    );

    selectPositionBox.querySelectorAll("div").forEach((pos) => {
        const img = pos.querySelector("img");
        img.classList.add("forbidden");

        const imgSplit = img.src.split("/lane/");
        imgSplit[1] = "금지흑.png";
        img.src = imgSplit.join("/lane/");
    });
}

function changeAllInit() {
    const selectPositionBox = document.querySelector(
        ".create-group-modal .select-position-box",
    );

    const POSITION = {
        jg: "정글",
        top: "탑",
        mid: "미드",
        adc: "바텀",
        sup: "서폿",
    };

    const positions = ["jg", "top", "mid", "adc", "sup"];

    positions.forEach((pos) => {
        const img = selectPositionBox.querySelector(`.position-${pos} img`);
        img.classList.remove("forbidden");
        img.parentElement.classList.remove("selected");

        const imgSplit = img.src.split("/lane/");
        imgSplit[1] = `${POSITION[pos]}흑.png`;
        img.src = imgSplit.join("/lane/");
    });
}
