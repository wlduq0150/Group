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
    const children = document.querySelector(`.${positionClassName}`).childNodes;
    children[3].innerHTML = "";
    noneBlockX(children[5].id);
});

function noneBlockX(xBtnId) {
    document.getElementById(`${xBtnId}`).style.display = "none";
}

function clickJg() {
    if (document.getElementById("1user").innerText) {
        return;
    } else {
        document.querySelector(".position-jg").innerHTML = `
    <img
      id="position"
      src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/정글흑.png"
      alt=""
      onclick="clickDarkJg()"
    /><div id="1user" class="user-name"></div>${xImg}`;
    }
}
function clickDarkJg() {
    if (document.getElementById("1user").innerText) {
        return;
    } else {
        document.querySelector(".position-jg").innerHTML = `
          <img
            id="position"
            src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/정글.png"
            alt=""
            onclick="clickJg()"
          /><div id="1user" class="user-name"></div>${xImg}`;
    }
}
function clickTop() {
    if (document.getElementById("2user").innerText) {
        return;
    } else {
        document.querySelector(".position-top").innerHTML = `
      <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑바텀흑.png"
        alt=""
        onclick="clickDarkTop()"
      /><div id="2user" class="user-name"></div>${xImg}`;
    }
}
function clickDarkTop() {
    if (document.getElementById("2user").innerText) {
        return;
    } else {
        document.querySelector(".position-top").innerHTML = `
            <img
              id="position"
              src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑.png"
              alt=""
              onclick="clickTop()"
            /><div id="2user" class="user-name"></div>${xImg}`;
    }
}
function clickMid() {
    if (document.getElementById("3user").innerText) {
        return;
    } else {
        document.querySelector(".position-mid").innerHTML = `
        <img
          id="position"
          src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/미드흑.png"
          alt=""
          onclick="clickDarkMid()"
        /><div id="3user" class="user-name"></div>${xImg}`;
    }
}
function clickDarkMid() {
    if (document.getElementById("3user").innerText) {
        return;
    } else {
        document.querySelector(".position-mid").innerHTML = `
              <img
                id="position"
                src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/미드.png"
                alt=""
                onclick="clickMid()"
              /><div id="3user" class="user-name"></div>${xImg}`;
    }
}
function clickAdc() {
    if (document.getElementById("4user").innerText) {
        return;
    } else {
        document.querySelector(".position-adc").innerHTML = `
        <img
          id="position"
          src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑바텀흑.png"
          alt=""
          onclick="clickDarkAdc()"
        /><div id="4user" class="user-name"></div> ${xImg}
      `;
    }
}
function clickDarkAdc() {
    if (document.getElementById("4user").innerText) {
        return;
    } else {
        document.querySelector(".position-adc").innerHTML = `
              <img
                id="position"
                src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/바텀.png"
                alt=""
                onclick="clickAdc()"
              /><div id="4user" class="user-name"></div>${xImg}`;
    }
}
function clickSup() {
    if (document.getElementById("5user").innerText) {
        return;
    } else {
        document.querySelector(".position-sup").innerHTML = `
        <img
          id="position"
          src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/서폿흑.png"
          alt=""
          onclick="clickDarkSup()"
        /><div id="5user" class="user-name"></div><img
        id="click5out"
        class="out-btn"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/menuIcon/엑스.png"
        alt=""
      />`;
    }
}
function clickDarkSup() {
    if (document.getElementById("5user").innerText) {
        return;
    } else {
        document.querySelector(".position-sup").innerHTML = `
              <img
                id="position"
                src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/서폿.png"
                alt=""
                onclick="clickSup()"
              /><div id="5user" class="user-name"></div><img
              id="click5out"
              class="out-btn"
              src="https://with-lol.s3.ap-northeast-2.amazonaws.com/menuIcon/엑스.png"
              alt=""
            />`;
    }
}
