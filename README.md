## <img style="width: 80px; height: 40px" src="https://with-lol.s3.ap-northeast-2.amazonaws.com/siteLogo/5.png">

LOL 기반의 실시간 게임 그룹 매칭 서비스 입니다.

<br>
<br>


## 👋 팀 소개

<table>
  <tbody>
    <tr align="center">
      <td align="center"><img src="https://github.com/wlduq0150/Group/assets/73841368/29b873b6-d26b-4897-999f-97dcbc020f63" width="100px;" alt=""/><br /></td>
      <td align="center"><img src="https://github.com/wlduq0150/Group/assets/73841368/937270bb-744b-4f99-af1b-5db146897786" width="100px;" alt=""/><br /></td>
      <td align="center"><img src="https://github.com/wlduq0150/Group/assets/73841368/f8e90480-3054-4571-9f5a-14f6eeb1b64a" width="100px;" alt=""/><br /></td>
      <td align="center"><img src="https://github.com/wlduq0150/Group/assets/73841368/ae4b485e-dd83-4770-b979-12703372ebe2" width="100px;" alt=""/><br /></td>
      <td align="center"><img src="https://github.com/wlduq0150/Group/assets/73841368/06c92865-e0a3-4545-a69e-05db2615ab1b" width="100px;" alt=""/><br /></td>
    </tr>
    <tr align="center">
  </tr>
  <tr align="center">
  <td width="300"><a href="https://github.com/wlduq0150">김지엽<br /></a></td>
  <td width="300"><a href="https://github.com/yujin0708">박유덕</a></td>
  <td width="300"><a href="https://github.com/kimchang312">김창민</a></td>
  <td width="300"><a href="https://github.com/poohtime">김다은</a></td>
  <td width="300"><a href="https://github.com/dnjs5432">이예원</a></td>
  </tr>
  <tr align="center">
    <td>
      팀장<br>
    </td>
    <td>
      부팀장<br>
    </td>
    <td>
      팀원<br>
    </td>
    <td>
      팀원<br>
    </td>
    <td>
      팀원<br>
    </td>
  </tr>
  </tr>
     <tr align="center" height="200">
    <td>
      그룹 기능<br>
      동시성 처리<br>
      랜덤 매칭<br>
      대용량 트래픽 개선<br>
    </td>
    <td>
      신고 기능<br>
      디스코드 로그인<br>
      그룹과 디스코드 연동<br>
    </td>
    <td>
      1:1 개인 채팅<br>
      사용자 LOL 프로필 연동<br>
    </td>
    <td>
      최근 그룹 목록<br>
      사용자 LOL 프로필 연동<br>
    </td>
    <td>
      친구 및 차단<br>
      서비스 로깅<br>
    </td>
  </tr>
  </tbody>
</table>

<br>
<br>

<h2>💡 프로젝트 소개</h2>
<p align='center'>
<b>DIFF</b>는 리그 오브 레전드의 <b>실시간 그룹 매칭 서비스</b> 입니다.
<br>
<br>
실시간으로 게임을 같이 할 사람들을 찾아다니며, 
<br>
<br>
<b>채팅 및 음성대화</b>를 통해서 서로에 대해 더 알아볼까요?
</p>
<br>

## 환경변수

```bash
NODE_ENV=development | production
SERVER_PORT=SERVER PORT
DATABASE_HOST=MYSQL HOST
DATABASE_PORT=MYSQL PORT
DATABASE_USERNAME=MYSQL USERNAME
DATABASE_PASSWORD=MYSQL PASSWORD
DATABASE_NAME=MYSQL DB NAME
SALT_ROUNDS=PASSWORD SALT
REDIS_HOST=REDIS HOST
REDIS_PORT=REDIS PORT
REDIS_PASSWORD=REDIS PASSWORD
DISCORD_CLIENT_ID=DISCORD API CLIENT ID
DISCORD_CLIENT_SECRET=DISCORD API CLIENT SECRET
DISCORD_REDIRECT_URI=DISCORD API CLIENT REDIRECT URL
DISCORD_SCOPE=identify email guilds.join
DISCORD_GUILD_ID=DISCORD GUILD ID
DISCORD_BOT_TOKEN=DISCORD API TOKEN
DISCORD_LOBBY_CHANNEL_ID=DISCORD LOBBY CHANNEL ID
DISCORD_PARENT_ID=DISCORD PARENT ID
SESSION_SECRET=SESSION SECERT
CACHE_REDIS_HOST=CACHE REDIS HOST
CACHE_REDIS_PORT=CACHE REDIS PORT
CACHE_REDIS_PASSWORD=CACHE REDIS PASSWORD
LOL_API_BASE=https://kr1.api.riotgames.com/lol/summoner/v4/summoners/by-name/
LOL_API_ACCOUNT_BASE=https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/
LOL_API_SUMMONER_BASE=https://kr1.api.riotgames.com/lol/summoner/v4/summoners/by-name/
LOL_API_KEY=LOL API KEY
MONGO_DB=MONGODB URL
```

## 실행

```bash
$ npm install

# development mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 🚀 배포 링크

<div>
    👉 <a href="http://diff.dizz.kr/html/index.html"><span> http://diff.dizz.kr/html/index.html </span></a> 
</div>

<br>
<br>

## 🎈 서비스 아키텍처

<img src="https://github.com/wlduq0150/Group/assets/73841368/d9f2b040-1d29-4364-b3af-e90a155598ba">

<br>
<br>

## 🧑🏻‍💻 주요 기술 스택

<!-- 프로젝트에 사용된 기술 스택을 나열 -->

### ⚡ Frontend

<div dir="auto">
    <img src="https://img.shields.io/badge/HTML5-B4CA65?style=for-the-badge&logo=EJS&logoColor=white">
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=CSS3&logoColor=white">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white">
    <img src="https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white">
</div>

### ⚡ Backend

<div dir="auto">
    <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white">
    <img src="https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white">
    <img src="https://img.shields.io/badge/Typeorm-262627?style=for-the-badge&logo=typeorm&logoColor=white">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white">
</div>

### ⚡ Database

<div dir="auto">
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white">
    <img src="https://img.shields.io/badge/Amazon RDS-527FFF?style=for-the-badge&logo=Amazon RDS&logoColor=white">
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=Redis&logoColor=white">
    <img src="https://img.shields.io/badge/mongodb-47A248?style=for-the-badge&logo=mongodb&logoColor=white">
    <img src="https://img.shields.io/badge/amazons3-569A31?style=for-the-badge&logo=amazons3&logoColor=white">
</div>

### ⚡ DevOps

<div dir="auto">
    <img src="https://img.shields.io/badge/Amazon EC2-FF9900?style=for-the-badge&logo=Amazon EC2&logoColor=white">
</div>

### ⚡ 협업툴

<div dir="auto">
    <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white">
    <img src="https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=Slack&logoColor=white">
    <img src="https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=Notion&logoColor=white">
</div>

<br>
<br>


## ⚔️ 기술적 의사결정

<img width="1048" alt="의사결정" src="https://github.com/wlduq0150/Group/assets/73841368/67c9747b-3146-4e99-96f1-f5947e9fb06a">

<br>
<br>

## 🪄 주요 기능

1. **실시간 그룹 생성, 삭제 및 유저 입/퇴장**

    - 

2. **그룹 내 채팅 및 유저간 1:1 채팅**

    - 

3. **그룹 찾기 완료시 그룹원 전원 디스코드 통화방으로 이동**

    -

4. **유저 게임 프로필 자동 갱신 및 조회**

    - 

5. **유저간 친구 및 차단**

    - 

6. **랜덤 그룹 매칭**

    -

<br>
<br>
