// const eventSource = new EventSource(`/notice/${userId}`);

// // SSE 이벤트 수신
// eventSource.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//     console.log("Received data:", data);
//     alert("친구 신청이 왔습니다!");
// };

// // SSE 연결이 열렸을 때
// eventSource.onopen = () => {
//     console.log("SSE connection opened");
// };

// // SSE 연결이 닫혔을 때
// eventSource.onclose = () => {
//     console.log("SSE connection closed");
// };

// // SSE 연결 에러가 발생했을 때
// eventSource.onerror = (error) => {
//     console.error("SSE connection error:", error);
// };

function showFriendRequest() {
    document
        .querySelector("#friendRequestContainer")
        .classList.remove("hidden");
}

function hideFriendRequest() {
    document.querySelector("#friendRequestContainer").classList.add("hidden");
}

async function acceptFriendRequest() {
    const modal = document.querySelector(".friend_request_modal");
    const senderID = modal.dataset.senderID;

    try {
        const response = await fetch(`/friend/${senderID}/accept`, {
            method: "POST",
        });

        const result = await response.json();

        hideFriendRequest();
        console.log("친구 수락 완료");
    } catch (e) {
        console.log(e);
    }
}

async function rejectFriendRequest() {
    const modal = document.querySelector(".friend_request_modal");
    const senderID = modal.dataset.senderID;

    try {
        const response = await fetch(`/friend/${senderID}/decline`, {
            method: "POST",
        });

        const result = await response.json();

        hideFriendRequest();
        console.log("친구 거절 완료");
    } catch (e) {
        console.log(e);
    }
}
