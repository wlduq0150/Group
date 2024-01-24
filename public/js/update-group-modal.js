function attachOutListener(id) {
    const out = document.getElementById(`click${id}out`);
    out.addEventListener("click", (e) => {
        const userName = document.getElementById(`${id}user`).innerText;
        if (!userName) {
            return;
        }
        noneBlockOutModal();
        changeUserName(userName);
        getOutPosition(out.parentElement.className);
    });
}

for (let i = 1; i <= 5; i++) {
    attachOutListener(i);
}

//모달창 키고 닫는 함수
function noneBlockOutModal() {
    if (document.querySelector(".out-box").style.display == "block") {
        document.querySelector(".out-box").style.display = "none";
    } else {
        document.querySelector(".out-box").style.display = "block";
    }
}

//모달창에 강퇴할 유저 이름 변경 함수
function changeUserName(userName) {
    document.querySelector(".out-user-name").innerHTML = `${userName}`;
}

//강퇴할 포지션값을 저장하는 함수
function getOutPosition(className) {
    document.querySelector(`.out-box`).setAttribute("id", `${className}`);
}

//강퇴 모달에서 취소 버튼 눌렀을때
const outCancel = document.querySelector(".out-cancel-btn");
outCancel.addEventListener("click", (e) => {
    noneBlockOutModal();
});

//강퇴 모달에서 강퇴 버튼 눌렀을때
const outAgree = document.querySelector(".out-agree-btn");
outAgree.addEventListener("click", (e) => {
    noneBlockOutModal();
    const positionClassName = document.querySelector(".out-box").id;
    const children = document.querySelector(
        `.update-select-position-box .${positionClassName}`,
    ).childNodes;
    children[3].style.visibility = "hidden";
    noneBlockX(children[5].id);
});

//x버튼 사라지기
function noneBlockX(xBtnId) {
    document.getElementById(`${xBtnId}`).style.visibility = "hidden";
}

const updateComplete = document.querySelector(
    ".update-group-modal .complete-btn",
);

//완료 버튼 눌렀을 때
updateComplete.addEventListener("click", (e) => {
    hideUpdateGroup();
});

//그룹 수정 숨기기
function hideUpdateGroup() {
    document.getElementById("updateGroupContainer").classList.add("hidden");
}

const positions = ["jg", "top", "mid", "adc", "sup"];

// function clickUpdate(position, isDark) {
//     const positionElement = document.querySelector(
//         `.update-select-position-box .position-${position}`,
//     );
//     const imgElement = positionElement.querySelector("img");
//     const userNameElement = positionElement.querySelector(".user-name");

//     if (userNameElement && userNameElement.innerText.trim() !== "") {
//         return;
//     }

//     const color = isDark ? "" : "흑";
//     imgElement.src = `https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/${Enum.Position[position]}${color}.png`;

//     if (!userNameElement || userNameElement.innerText.trim() === "") {
//         imgElement.onclick = () => clickUpdate(position, !isDark);
//     }
// }

function clickUpdate(e) {
    const target = e.currentTarget;

    const isPositionActive = target.classList.contains("isPositionActive");
    const img = target.querySelector("#updatePosition");
    const imgSrc = decodeURIComponent(img.src);
    const imgSplit = imgSrc.split("/lane/");
    const imgPos = imgSplit[1].replace(".png", "");

    if (isPositionActive) {
        imgSplit[1] = imgPos + "흑" + ".png";
        target.classList.remove("isPositionActive");
    } else {
        console.log("흑흑");
        imgSplit[1] = imgPos.replace("흑", "") + ".png";
        target.classList.add("isPositionActive");
    }

    const updateImgSrc = imgSplit.join("/lane/");
    console.log(updateImgSrc);
    img.src = updateImgSrc;
}

positions.forEach((position) => {
    window[
        `clickUpdate${position.charAt(0).toUpperCase() + position.slice(1)}`
    ] = () => clickUpdate(position, false);
    window[
        `clickUpdateDark${position.charAt(0).toUpperCase() + position.slice(1)}`
    ] = () => clickUpdate(position, true);
});
