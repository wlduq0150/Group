const xImg = `<img
style="visibility:hidden"
id="click1out"
class="out-btn"
src="https://with-lol.s3.ap-northeast-2.amazonaws.com/menuIcon/엑스.png"
alt=""
/>`;
const firstOut = document.getElementById("click1out");
firstOut.addEventListener("click", (e) => {
    const userName = document.getElementById("1user").innerText;
    if (!userName) {
        //강퇴할 유저가 없으면 실행하지 않음
        return;
    }
    noneBlockOutModal();
    changeUserName(userName);
    getOutPosition(firstOut.parentElement.className);
});

const secondtOut = document.getElementById("click2out");
secondtOut.addEventListener("click", (e) => {
    const userName = document.getElementById("2user").innerText;
    if (!userName) {
        return;
    }
    noneBlockOutModal();
    changeUserName(userName);
    getOutPosition(secondtOut.parentElement.className);
});

const thirdOut = document.getElementById("click3out");
thirdOut.addEventListener("click", (e) => {
    const userName = document.getElementById("3user").innerText;
    if (!userName) {
        return;
    }
    noneBlockOutModal();
    changeUserName(userName);
    getOutPosition(thirdOut.parentElement.className);
});

const fouthOut = document.getElementById("click4out");
fouthOut.addEventListener("click", (e) => {
    const userName = document.getElementById("4user").innerText;
    if (!userName) {
        return;
    }
    noneBlockOutModal();
    changeUserName(userName);
    getOutPosition(fouthOut.parentElement.className);
});

const fifthOut = document.getElementById("click5out");
fifthOut.addEventListener("click", (e) => {
    const userName = document.getElementById("5user").innerText;
    if (!userName) {
        return;
    }
    noneBlockOutModal();
    changeUserName(userName);
    getOutPosition(fifthOut.parentElement.className);
});

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
    document.getElementById("updateGroupContainer").classList.add("hidden");
});

function clickUpdateJg() {
    if (document.getElementById("1user").innerText) {
        return;
    } else {
        document.querySelector(
            ".update-select-position-box .position-jg",
        ).innerHTML = `
    <img
      id="updatePosition"
      src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/정글흑.png"
      alt=""
      onclick="clickUpdateDarkJg()"
    /><div id="1user" class="user-name" style="visibility:hidden">이름</div>${xImg}`;
    }
}
function clickUpdateDarkJg() {
    if (document.getElementById("1user").innerText) {
        return;
    } else {
        document.querySelector(
            ".update-select-position-box .position-jg",
        ).innerHTML = `
          <img
            id="updatePosition"
            src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/정글.png"
            alt=""
            onclick="clickUpdateJg()"
          /><div id="1user" class="user-name" style="visibility:hidden">이름</div>${xImg}`;
    }
}
function clickUpdateTop() {
    if (document.getElementById("2user").innerText) {
        return;
    } else {
        document.querySelector(
            ".update-select-position-box .position-top",
        ).innerHTML = `
      <img
        id="updatePosition"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑흑.png"
        alt=""
        onclick="clickUpdateDarkTop()"
      /><div id="2user" class="user-name" style="visibility:hidden">이름</div>${xImg}`;
    }
}
function clickUpdateDarkTop() {
    if (document.getElementById("2user").innerText) {
        return;
    } else {
        document.querySelector(
            ".update-select-position-box .position-top",
        ).innerHTML = `
            <img
              id="updatePosition"
              src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑.png"
              alt=""
              onclick="clickUpdateTop()"
            /><div id="2user" class="user-name" style="visibility:hidden">이름</div>${xImg}`;
    }
}
function clickUpdateMid() {
    if (document.getElementById("3user").innerText) {
        console.log("실행");
        return;
    } else {
        document.querySelector(
            ".update-select-position-box .position-mid",
        ).innerHTML = `
        <img
          id="updatePosition"
          src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/미드흑.png"
          alt=""
          onclick="clickUpdateDarkMid()"
        /><div id="3user" class="user-name" style="visibility:hidden">이름</div>${xImg}`;
    }
}
function clickUpdateDarkMid() {
    if (document.getElementById("3user").innerText) {
        return;
    } else {
        document.querySelector(
            ".update-select-position-box .position-mid",
        ).innerHTML = `
              <img
                id="updatePosition"
                src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/미드.png"
                alt=""
                onclick="clickUpdateMid()"
              /><div id="3user" class="user-name" style="visibility:hidden">이름</div>${xImg}`;
    }
}
function clickUpdateAdc() {
    if (document.getElementById("4user").innerText) {
        return;
    } else {
        document.querySelector(
            ".update-select-position-box .position-adc",
        ).innerHTML = `
        <img
          id="updatePosition"
          src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/바텀흑.png"
          alt=""
          onclick="clickUpdateDarkAdc()"
        /><div id="4user" class="user-name" style="visibility:hidden">이름</div> ${xImg}
      `;
    }
}
function clickUpdateDarkAdc() {
    if (document.getElementById("4user").innerText) {
        return;
    } else {
        document.querySelector(
            ".update-select-position-box .position-adc",
        ).innerHTML = `
              <img
                id="updatePosition"
                src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/바텀.png"
                alt=""
                onclick="clickUpdateAdc()"
              /><div id="4user" class="user-name" style="visibility:hidden">이름</div>${xImg}`;
    }
}
function clickUpdateSup() {
    if (document.getElementById("5user").innerText) {
        return;
    } else {
        document.querySelector(
            ".update-select-position-box .position-sup",
        ).innerHTML = `
        <img
          id="updatePosition"
          src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/서폿흑.png"
          alt=""
          onclick="clickUpdateDarkSup()"
        /><div id="5user" class="user-name" style="visibility:hidden">이름</div>${xImg}`;
    }
}
function clickUpdateDarkSup() {
    if (document.getElementById("5user").innerText) {
        return;
    } else {
        document.querySelector(
            ".update-select-position-box .position-sup",
        ).innerHTML = `
              <img
                id="updatePosition"
                src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/서폿.png"
                alt=""
                onclick="clickUpdateSup()"
              /><div id="5user" class="user-name" style="visibility:hidden">이름</div>${xImg}`;
    }
}
