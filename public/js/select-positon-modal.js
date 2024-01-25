function showSelectPosition() {
    showGroupManage();
    document
        .getElementById("positionSelectContainer")
        .classList.remove("hidden");
}

function hideSelectPosition() {
    document.getElementById("positionSelectContainer").classList.add("hidden");
}

// 완료 버튼 누를시
document
    .querySelector(".select-position-parent .complete-btn")
    .addEventListener("click", (e) => {
        hideSelectPosition();
    });

function checkIsSelected(target) {
    if (target.classList.contains("selected")) {
        return true;
    }
    return false;
}

function setSPActive(target, name) {
    let src = decodeURIComponent(target.querySelector("#position").src);
    const srcSplit = src.split("/lane/");
    const pos = srcSplit[srcSplit.length - 1].replace(".png", "");

    if (pos[pos.length - 1] !== "흑") {
        return;
    }

    srcSplit[srcSplit.length - 1] = `${pos.replaceAll("흑", "")}.png`;
    src = srcSplit.join("/lane/");
    target.querySelector("img").src = src;
    target.querySelector("#userName").innerHTML = name;
    target.classList.add("selected");
    target.classList.remove("forbidden");
}

function setSPDisable(target) {
    let src = decodeURIComponent(target.querySelector("img").src);
    const srcSplit = src.split("/lane/");
    const pos = srcSplit[srcSplit.length - 1].replace(".png", "");
    const isForibidden = target.classList.contains("forbidden");

    if (!isForibidden && pos[pos.length - 1] === "흑") {
        return;
    }

    srcSplit[srcSplit.length - 1] = `${pos}흑.png`;
    src = srcSplit.join("/lane/");

    target.querySelector("img").src = src;
    target.querySelector("#userName").innerHTML = `<br>`;
    target.classList.remove("selected");
    target.classList.remove("forbidden");
}

function setSPForbidden(target) {
    let src = target.querySelector("img").src;
    const srcSplit = src.split("/lane/");

    srcSplit[srcSplit.length - 1] = `금지흑.png`;
    src = srcSplit.join("/lane/");

    target.querySelector("img").src = src;
    target.querySelector("#userName").innerHTML = `<br>`;
    target.classList.add("forbidden");
}

// document
//     .querySelector(".select-position-parent .position-jg")
//     .addEventListener("click", (e) => {
//         setActive(e.currentTarget, "이름");
//     });
