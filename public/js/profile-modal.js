async function getUserProfile(clickUserId, discordUserName) {
    fetch(`/lol/user/${clickUserId}`, {
        method: "GET",
    })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            document.querySelector(".lol-profile-icon").innerHTML = `<img
      src="https://with-lol.s3.ap-northeast-2.amazonaws.com/profile_icon/${data.user.profileIconId}.png"
      alt=""
    />`;
            document.querySelector(".name-box .discord-name").innerHTML =
                `${discordUserName}`;
            document.querySelector(".lol-name-tag").innerHTML =
                `${data.user.gameName}#${data.user.gameTag}`;
            document.querySelector(".user-comment").innerHTML =
                `${data.user.comment}`;
            document.querySelector(".user-popular-score").innerHTML =
                `♥${data.user.popular}`;
            let tier = data.user.tier;
            let tierFirst = tier.charAt(0);
            let others = tier.slice(1).toLowerCase();
            tier = tierFirst.toUpperCase() + others;
            document.querySelector(".tier-icon").innerHTML = `<img
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/tier/Rank%3D${tier}.png"
        alt=""
      />`;
            document.querySelector(".tier-rank").innerHTML =
                `${tier} ${data.user.rank}`;
            document.querySelector(".league-points").innerHTML =
                `${data.user.leaguePoints} LP`;

            const winRate = Math.round(
                (Number(data.user.wins) /
                    (Number(data.user.wins) + Number(data.user.losses))) *
                    100,
            );
            document.querySelector(".win-rate").innerHTML =
                `<div class="win-rate" onmouseenter="mouseenterHandler()" onmouseleave="mouseleaveHandler()"  style="background:conic-gradient(#5383e8 0% ${winRate}%, #E84057 25% ${
                    100 - winRate
                }%);"  ><span class="center" > <span id="win-rate">${winRate}% </span><span class="wins-losses-box" style="display:none">${
                    data.user.wins
                }승 ${data.user.losses}패</span></div>`;
            let mostChampionsParent = document.querySelector(
                ".champion-box-parent",
            );
            let mostChampionsBox = "";
            for (let i = 0; i < mostChampionCount; i++) {
                const champKda = (
                    (Number(data.champion[i].kills) +
                        Number(data.champion[i].assists)) /
                    Number(data.champion[i].deaths)
                ).toFixed(2);
                const totalGame =
                    Number(data.champion[i].wins) +
                    Number(data.champion[i].losses);
                const winRate = Math.round(
                    (Number(data.champion[i].wins) / totalGame) * 100,
                );

                mostChampionsBox =
                    mostChampionsBox +
                    `
        <div class="most-champion-box">
        <div class="champion-icon-box">
        <img
        class="champion-icon"
          src="https://with-lol.s3.ap-northeast-2.amazonaws.com/champions/${
              data.champion[i].championName
          }.png"
          alt=""
        />
        </div>
        <div class="champion-info-box">
            <div class="champion-name">${data.champion[i].championName}</div>
            </div>
            <div class="champion-kda"><div><span class="kda">${champKda}:1 평점</span></div>
            <div class="champion-kills-deaths-assists">
            <span>${(data.champion[i].kills / totalGame).toFixed(1)}/</span>
            <span>${(data.champion[i].deaths / totalGame).toFixed(1)}/</span>
            <span>${(data.champion[i].assists / totalGame).toFixed(1)}</span>
            
            </div>
        </div>
        <div class="champ-win-box">
          <div>${winRate}%</div>
          <span>${totalGame} 게임</span>
         </div>
         </div>
        `;
            }
            mostChampionsParent.innerHTML = `${mostChampionsBox}`;
        });

    return;
}

const clickUserId = 1;
const mostChampionCount = 3;
//프로필 켜기
const clickProfileBtn = document.querySelector("#profile .my-profile-btn");
clickProfileBtn.addEventListener("click", (e) => {
    openProfile(userId);
});
//discordUserId 로 discord이름과 lolUser정보 가져오기
async function getLolUserId(discordUserId) {
    const res = await fetch(`/lol/discordUser/${discordUserId}`, {
        method: "GET",
    });
    if (!res.redirected) {
        return;
    }
    const resp = await fetch(`/user/${discordUserId}`, { method: "GET" });
    const discordUserName = await resp.text();
    getUserProfile(lolUser, discordUserName);
}
//프로필을 켰을때 작동하는 함수
function openProfile(discordUserId) {
    showProfileModal();
    getLolUserId(discordUserId);
}

function mouseenterHandler() {
    document.getElementById("win-rate").style.display = "none";
    document.querySelector(".wins-losses-box").style.display = "block";
}

function mouseleaveHandler() {
    document.getElementById("win-rate").style.display = "block";
    document.querySelector(".wins-losses-box").style.display = "none";
}
//프로필 보여주거나 감추기
function showProfileModal() {
    const checkProfile = document.querySelector("#profileContainer");
    if (checkProfile.className == "hidden") {
        checkProfile.classList.remove("hidden");
    } else {
        checkProfile.classList.add("hidden");
    }
}

document.querySelector(".close-btn").addEventListener("click", (e) => {
    document.querySelector("#profileContainer").classList.add("hidden");
});
