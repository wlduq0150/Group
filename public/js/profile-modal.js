const mostChampionCount = 3;

async function getUserProfile(lolUserId, discordUserName) {
    fetch(`/lol/user/${lolUserId}`, {
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
            document
                .querySelector(".parent .name-box")
                .setAttribute("data-id", `${userId}`);

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

            let winRate = Math.round(
                (Number(data.user.wins) /
                    (Number(data.user.wins) + Number(data.user.losses))) *
                    100,
            );
            isNaN(winRate) ? (winRate = 0) : winRate;
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
            console.log(data.user.lolChampions);
            if (data.user.lolChampions.length) {
                for (let i = 0; i < mostChampionCount; i++) {
                    const champKda = (
                        (Number(data.user.lolChampions[i].kills) +
                            Number(data.user.lolChampions[i].assists)) /
                        Number(data.user.lolChampions[i].deaths)
                    ).toFixed(2);
                    const totalGame =
                        Number(data.user.lolChampions[i].wins) +
                        Number(data.user.lolChampions[i].losses);
                    const winRate = Math.round(
                        (Number(data.user.lolChampions[i].wins) / totalGame) *
                            100,
                    );

                    mostChampionsBox =
                        mostChampionsBox +
                        `
            <div class="most-champion-box">
            <div class="champion-icon-box">
            <img
            class="champion-icon"
              src="https://with-lol.s3.ap-northeast-2.amazonaws.com/champions/${
                  data.user.lolChampions[i].championName
              }.png"
              alt=""
            />
            </div>
            <div class="champion-info-box">
                <div class="champion-name">${
                    data.user.lolChampions[i].championName
                }</div>
                </div>
                <div class="champion-kda"><div><span class="kda">${champKda}:1 평점</span></div>
                <div class="champion-kills-deaths-assists">
                <span>${(data.user.lolChampions[i].kills / totalGame).toFixed(
                    1,
                )}/</span>
                <span>${(data.user.lolChampions[i].deaths / totalGame).toFixed(
                    1,
                )}/</span>
                <span>${(data.user.lolChampions[i].assists / totalGame).toFixed(
                    1,
                )}</span>
                
                </div>
            </div>
            <div class="champ-win-box">
              <div>${winRate}%</div>
              <span>${totalGame} 게임</span>
             </div>
             </div>
            `;
                }
            } else if (tier != "unRanked") {
                mostChampionsBox = `<div>챔피언 정보를 불러오는 중입니다<div>`;
            } else {
                mostChampionsBox = `<div>이번 시즌 솔로 랭크 배치를 완료하지 않아 플레이한 챔피언 정보가 없습니다</div>`;
            }
            mostChampionsParent.innerHTML = `${mostChampionsBox}`;
        })
        .then((e) => {
            const loading = document.querySelector(".parent .loading");
            loading.style.visibility = "hidden";
            loading.classList.add("paused");
        })
        .catch((err) => {
            console.log(err);
        });
}

//discordUserId 로 discord이름과 lolUser정보 가져오기
async function getLolUserId(discordUserId) {
    const resp = await fetch(`/user/${discordUserId}`, { method: "GET" });
    const discordUserName = await resp.text();
    const res = await fetch(`/lol/discordUser/${discordUserId}`, {
        method: "GET",
    });
    const me = discordUserId == userId;
    if (res.status >= 400) {
        noDataLolUser(discordUserId, discordUserName, me);
        return;
    }
    const lolUser = await res.text();

    getUserProfile(lolUser, discordUserName);
}

//프로필을 켰을때 작동하는 함수
function openProfile(discordUserId) {
    if (!discordUserId) {
        return;
    }

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

        document.querySelector(".parent").style.display = "flex";
        document.querySelector(".not-connect-modal").style.display = "none";
    } else {
        checkProfile.classList.add("hidden");
        document.querySelector(".not-connect-modal").style.display = "none";
    }
}

document.querySelector(".parent .close-btn").addEventListener("click", (e) => {
    document.querySelector("#profileContainer").classList.add("hidden");
});

document
    .querySelector(".not-connect-modal .close-btn")
    .addEventListener("click", (e) => {
        showProfileModal();
        document.querySelector(".not-connect-modal").style.display = "none";
    });

//유저가 롤과 연동하지 않았을 때
function noDataLolUser(discordUserId, discordUserName, me) {
    //내가 연동하지 않았을 때
    if (me) {
        document.querySelector(".parent").style.display = "none";
        document.querySelector(".not-connect-modal").style.display = "flex";
        document.querySelector(
            ".not-connect-modal .linking-account-btn",
        ).style.visibility = "visible";
    } else {
        document.querySelector(".parent").style.display = "none";
        document.querySelector(".not-connect-modal").style.display = "flex";
        document.querySelector(
            ".not-connect-modal .linking-account-btn",
        ).style.visibility = "hidden";
        console.log(discordUserName + discordUserId);
        const discordName = document.querySelector(
            ".not-connect-modal .discord-name",
        );
        discordName.innerHTML = `${discordUserName}`;
        discordName.setAttribute("data-id", `${discordUserId}`);
    }
}

//계정연동 버튼을 눌렀을 때
document
    .querySelector(".not-connect-modal .linking-account-btn")
    .addEventListener("click", (e) => {
        const lolName = prompt("롤 닉네임을 입력해주세요");
        const lolTag = prompt("롤 태그를 입력해주세요");
        showProfileModal();
        document.querySelector(".not-connect-modal").style.display = "none";
        linkingLolUser(lolName, lolTag, userId);
    });

//계정연동
async function linkingLolUser(lolName, lolTag, userId) {
    const loading = document.querySelector(".parent .loading");
    loading.style.visibility = "visible";
    loading.classList.remove("paused");
    await fetch(`/lol`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: lolName, tag: lolTag, userId: +userId }),
    })
        .then((res) => {
            console.log(res);
            if (res.status >= 400) {
                document.querySelector(".parent .loading").style.visibility =
                    "hidden";
            } else {
                console.log("계정이 정보를 저장했어요");
            }
        })
        .catch((e) => {
            console.log(e);
        });
}
