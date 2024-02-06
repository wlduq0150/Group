document
    .getElementById("createGroupBtn")
    .addEventListener("click", loadExternalHtml);

window.onclick = function (e) {
    let modal = document.getElementById("myModal");
    if (e.target == modal) {
        closeModal();
    }
};

function closeModal() {
    document.getElementById("myModal").style.display = "none";
}

function showModal() {
    document.getElementById("myModal").style.display = "block";
}

document
    .getElementById("modal-body")
    .addEventListener("click", function (event) {
        // 취소 버튼
        if (event.target.matches(".close-btn")) {
            closeModal();
        }

        // 포지션 선택
        if (e.target.id === "position") {
            const positionClass = e.target.parentNode.className;

            switch (positionClass) {
                case "position-jg":
                    clickJg();
                    break;
                case "position-top":
                    clickTop();
                    break;
                case "position-mid":
                    clickMid();
                    break;
                case "position-adc":
                    clickAdc();
                    break;
                case "position-sup":
                    clickSup();
                    break;
            }
        }
    });

async function loadExternalHtml() {
    try {
        const response = await fetch("create-group-modal.html");
        const html = await response.text();
        document.getElementById("modal-body").innerHTML = html;

        showModal();
    } catch (err) {
        console.log("페이지 불러오기 실패: ", err);
    }
}

function clickDarkJg() {
    document.querySelector(".position-jg").innerHTML = `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/정글.png"
        alt=""
        onclick="clickJg()"
      />
    `;
}
function clickJg() {
    document.querySelector(".position-jg").innerHTML = `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/정글흑.png"
        alt=""
        onclick="clickDarkJg()"
      />
    `;
}
function clickDarkTop() {
    document.querySelector(".position-top").innerHTML = `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑.png"
        alt=""
        onclick="clickTop()"
      />
    `;
}
function clickTop() {
    document.querySelector(".position-top").innerHTML = `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑바텀흑.png"
        alt=""
        onclick="clickDarkTop()"
      />
    `;
}
function clickDarkMid() {
    document.querySelector(".position-mid").innerHTML = `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/미드.png"
        alt=""
        onclick="clickMid()"
      />
    `;
}
function clickMid() {
    document.querySelector(".position-mid").innerHTML = `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/미드흑.png"
        alt=""
        onclick="clickDarkMid()"
      />
    `;
}
function clickDarkAdc() {
    document.querySelector(".position-adc").innerHTML = `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/바텀.png"
        alt=""
        onclick="clickAdc()"
      />
    `;
}
function clickAdc() {
    document.querySelector(".position-adc").innerHTML = `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑바텀흑.png"
        alt=""
        onclick="clickDarkAdc()"
      />
    `;
}
function clickDarkSup() {
    document.querySelector(".position-sup").innerHTML = `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/서폿.png"
        alt=""
        onclick="clickSup()"
      />
    `;
}
function clickSup() {
    document.querySelector(".position-sup").innerHTML = `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/서폿흑.png"
        alt=""
        onclick="clickDarkSup()"
      />
    `;
}

// 신고 테스트
async function report() {
    try {
        const response = await fetch("/report/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                reportedUser: 1,
                reportedAgainstUserId: 2,
                reportCategory: "언어 폭력",
                reportLocation: "채팅방",
                reportContent:
                    "안녕하세요\n시발 내말 안들려?\n야이 자식아 닥쳐\nㅋㅋㅋㅋ 어쩌라고",
                reportDetail: "얘가 욕함",
            }),
        });

        const data = await response.json();
        console.log("신고 성공: ", data);
    } catch (err) {
        console.log("신고 실패: ", err);
    }
}

// DB에 필터링 단어 저장
async function saveFilterWords() {
    try {
        const response = await fetch("/report/loadFilterWords", {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error("DB에 필터링 단어 저장 실패");
        }
    } catch (err) {
        console.log(err);
    }
}
