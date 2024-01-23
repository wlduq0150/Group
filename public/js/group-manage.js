const positionSelectBtn = document.getElementById("groupPositionSelect");
const updateGroupBtn = document.getElementById("updateGroupSetting");

positionSelectBtn.addEventListener("click", (e) => {
    document
        .getElementById("positionSelectContainer")
        .classList.remove("hidden");
});
updateGroupBtn.addEventListener("click", (e) => {
    document.getElementById("updateGroupContainer").classList.remove("hidden");
});
