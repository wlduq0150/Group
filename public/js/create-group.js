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
