function getUserProfile(clickUserId) {
  fetch(`${mainServer}lol/user/${clickUserId}`, {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      document.querySelector(".lol-profile-icon").innerHTML = `<img
      src="https://with-lol.s3.ap-northeast-2.amazonaws.com/profile_icon/${data.user.profileIconId}.png"
      alt=""
    />`;
      document.querySelector(
        ".lol-name-tag"
      ).innerHTML = `${data.user.gameName}#${data.user.gameTag}`;
      let tier = data.user.tier;
      let tierFirst = tier.charAt(0);
      let others = tier.slice(1).toLowerCase();
      tier = tierFirst.toUpperCase() + others;
      document.querySelector(".tier-icon").innerHTML = `<img
        src="https://with-lol.s3.ap-northeast-2.amazonaws.com/tier/Rank%3D${tier}.png"
        alt=""
      />`;
      document.querySelector(
        ".tier-rank"
      ).innerHTML = `${tier} ${data.user.rank}`;
      document.querySelector(
        ".league-points"
      ).innerHTML = `${data.user.leaguePoints} LP`;

      const winRate = Math.round(
        (Number(data.user.wins) /
          (Number(data.user.wins) + Number(data.user.losses))) *
          100
      );
      document.querySelector(
        ".win-rate"
      ).innerHTML = `<div class="win-rate" onmouseenter="mouseenterHandler()" onmouseleave="mouseleaveHandler()"  style="background:conic-gradient(#5383e8 0% ${winRate}%, #E84057 25% ${
        100 - winRate
      }%);"  ><span class="center" > <span id="win-rate">${winRate}% </span><span class="wins-losses" style="display:none">${
        data.user.wins
      }승 ${data.user.losses}패</span></div>`;
      let mostChampionsParent = document.querySelector(".champion-box-parent");

      for (let i = 0; i < mostChampionCount; i++) {
        const champKda = (
          (Number(data.champion[i].kills) + Number(data.champion[i].assists)) /
          Number(data.champion[i].deaths)
        ).toFixed(1);
        const totalGame =
          Number(data.champion[i].wins) + Number(data.champion[i].losses);
        const winRate = Math.round(
          (Number(data.champion[i].wins) / totalGame) * 100
        );
        let mostChampionsChild = document.createElement("div");
        mostChampionsParent.appendChild(mostChampionsChild);

        mostChampionsChild.innerHTML = `
        <div class="most-champion-box" >
        <div class="champion-icon">
        <img
          src="https://with-lol.s3.ap-northeast-2.amazonaws.com/champions/${data.champion[i].championName}.png"
          alt=""
        />
        </div>
        <div class="champion-info-box">
            <div class="champion-name">${data.champion[i].championName}</div>
            <div>${champKda}</div>
        </div>
        <div class="champ-win-box">
          <div>${winRate}%</div>
          <div>${totalGame} 게임</div>
         </div>
        </div>`;
      }
    });

  return;
}

getUserProfile(clickUserId);

function mouseenterHandler() {
  document.getElementById("win-rate").style.display = "none";
  document.querySelector(".wins-losses").style.display = "block";
}

function mouseleaveHandler() {
  document.getElementById("win-rate").style.display = "block";
  document.querySelector(".wins-losses").style.display = "none";
}
