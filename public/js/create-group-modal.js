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

function resetCreateGroupModal() {
    const titleElement = document.querySelector(
        ".create-group-modal .group-title-input",
    );
    const modeElement = document.querySelector(
        ".create-group-modal .create-group-mode",
    );
    const tierElement = document.querySelector(
        ".create-group-modal .group-tier-box",
    );
    const passwordElement = document.querySelector(
        ".create-group-modal .private-password",
    );
    const selectPositionBox = document.querySelector(
        ".create-group-modal .select-position-box",
    );

    titleElement.value = "";
    modeElement.value = "nomal-game";
    tierElement.value = "challenger";
    passwordElement.value = "";
    selectPositionBox.innerHTML = `
    <div class="position-jg">
        <img id="position" src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/정글흑.png" alt=""
        onclick="createGroupClickUpdate(event)" />
    </div>
    <div class="position-top">
        <img id="position" src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑흑.png" alt=""
        onclick="createGroupClickUpdate(event)" />
    </div>
    <div class="position-mid">
        <img id="position" src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/미드흑.png" alt=""
        onclick="createGroupClickUpdate(event)" />
    </div>
    <div class="position-adc">
        <img id="position" src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/바텀흑.png" alt=""
        onclick="createGroupClickUpdate(event)" />
    </div>
    <div class="position-sup">
        <img id="position" src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/서폿흑.png" alt=""
        onclick="createGroupClickUpdate(event)" />
    </div>
    `;
}

function resetClickFunction() {
    const selectPositionBox = document.querySelector(
        ".create-group-modal .select-position-box",
    );

    selectPositionBox.childNodes.forEach((pos) => {});
}

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
        const posName = pos[0].toUpperCase().concat(pos.slice(1, 3));

        const imgSplit = img.src.split("/lane/");
        imgSplit[1] = `${POSITION[pos]}흑.png`;
        img.src = imgSplit.join("/lane/");
    });
}

function createGroupClickUpdate(e) {
    const img = e.currentTarget;
    const parent = img.parentElement;

    const isPositionSelected = parent.classList.contains("selected");

    const imgSrc = decodeURIComponent(img.src);
    const imgSplit = imgSrc.split("/lane/");
    const imgPos = imgSplit[1].replace(".png", "");

    if (isPositionSelected) {
        imgSplit[1] = imgPos + "흑" + ".png";
        parent.classList.remove("selected");
    } else {
        imgSplit[1] = imgPos.replace("흑", "") + ".png";
        parent.classList.add("selected");
    }

    const updateImgSrc = imgSplit.join("/lane/");
    img.src = updateImgSrc;
}
