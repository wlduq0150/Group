const selectComplete = document.querySelector(
    ".select-position-parent .complete-btn",
);

selectComplete.addEventListener("click", (e) => {
    document.getElementById("positionSelectContainer").classList.add("hidden");
});
document.querySelector(".select-position-parent .position-jg").innerHTML = `
<img id="position"
src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/정글흑.png"
alt="" onclick="clickDarkJg()"/><div id="userName" class="jg-user-name"><br></div>`;
document.querySelector(".select-position-parent .position-top").innerHTML = `
<img id="position"
src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑바텀흑.png"
alt="" onclick="clickDarkTop()"/><div id="userName" class="top-user-name"><br></div>`;
document.querySelector(".select-position-parent .position-mid").innerHTML = `
<img id="position"
src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/미드흑.png"
alt="" onclick="clickDarkMid()"/><div id="userName" class="mid-user-name"><br></div>`;
document.querySelector(".select-position-parent .position-adc").innerHTML = `
<img id="position"
src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑바텀흑.png"
alt="" onclick="clickDarkAdc()"/><div id="userName" class="adc-user-name"><br></div>`;
document.querySelector(".select-position-parent .position-sup").innerHTML = `
<img id="position"
src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/서폿흑.png"
alt="" onclick="clickDarkSup()"/><div id="userName" class="sup-user-name"><br></div>`;
function clickDarkJg() {
    document.querySelector(".select-position-parent .position-jg").innerHTML = `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/정글.png"
        alt=""
        onclick="clickJg()"
      /><div id="userName" class="jg-user-name">이름</div>
    `;
}
function clickJg() {
    document.querySelector(".select-position-parent .position-jg").innerHTML = `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/정글흑.png"
        alt=""
        onclick="clickDarkJg()"
      /><br><div id="userName" class="jg-user-name"></div>
    `;
}
function clickDarkTop() {
    document.querySelector(".select-position-parent .position-top").innerHTML =
        `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑.png"
        alt=""
        onclick="clickTop()"
      /><div id="userName" class="top-user-name">이름</div>
    `;
}
function clickTop() {
    document.querySelector(".select-position-parent .position-top").innerHTML =
        `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑바텀흑.png"
        alt=""
        onclick="clickDarkTop()"
      /><div id="userName" class="top-user-name"><br></div>
    `;
}
function clickDarkMid() {
    document.querySelector(".select-position-parent .position-mid").innerHTML =
        `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/미드.png"
        alt=""
        onclick="clickMid()"
      /><div id="userName" class="mid-user-name">이름</div>
    `;
}
function clickMid() {
    document.querySelector(".select-position-parent .position-mid").innerHTML =
        `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/미드흑.png"
        alt=""
        onclick="clickDarkMid()"
      /><div id="userName" class="mid-user-name"><br></div>
    `;
}
function clickDarkAdc() {
    document.querySelector(".select-position-parent .position-adc").innerHTML =
        `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/바텀.png"
        alt=""
        onclick="clickAdc()"
      /><div id="userName" class="adc-user-name">이름</div>
    `;
}
function clickAdc() {
    document.querySelector(".select-position-parent .position-adc").innerHTML =
        `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/탑바텀흑.png"
        alt=""
        onclick="clickDarkAdc()"
      /><div id="userName" class="adc-user-name"><br></div>
    `;
}
function clickDarkSup() {
    document.querySelector(".select-position-parent .position-sup").innerHTML =
        `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/서폿.png"
        alt=""
        onclick="clickSup()"
      /><div id="userName" class="sup-user-name">이름</div>
    `;
}
function clickSup() {
    document.querySelector(".select-position-parent .position-sup").innerHTML =
        `
    <img
        id="position"
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/lane/서폿흑.png"
        alt=""
        onclick="clickDarkSup()"
      /><div id="userName" class="sup-user-name"><br></div>
    `;
}
