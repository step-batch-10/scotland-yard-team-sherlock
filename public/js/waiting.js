const createImage = () => {
  const img = document.createElement("img");
  img.setAttribute("src", "./assets/badgeImg.png");
  img.alt = "badge";

  return img;
};

const createBadge = (color) => {
  const badge = document.createElement("figure");
  const img = createImage();
  img.style.border = `6px solid ${color}`;
  badge?.append(img);

  return badge;
};

const addCaption = (playerContainer, name, isMrx) => {
  const role = isMrx ? "Mr.X" : "Detective";
  const figcaption = document.createElement("figcaption");
  figcaption.textContent = `${name} : ${role}`;

  playerContainer?.append(figcaption);
};

const addToWaitingBoard = ({ name, isMrx, color }) => {
  const playerContainer = document.createElement("div");
  const badge = createBadge(color);
  addCaption(badge, name, isMrx);
  playerContainer?.append(badge);
  return playerContainer;
};

const renderPlayerRoles = (playersInfo) => {
  const waitingBoard = document.querySelector("#waiting-board");
  waitingBoard.textContent = "";

  playersInfo.forEach((playerInfo) => {
    const playerContainer = addToWaitingBoard(playerInfo);
    waitingBoard?.append(playerContainer);
  });
};

const addName = (playerContainer, playerName) => {
  const figcaption = document.createElement("figcaption");
  figcaption.textContent = playerName;
  playerContainer?.append(figcaption);
};

const renderPlayerNames = (players) => {
  const waitingBoard = document.querySelector("#waiting-board");
  waitingBoard.textContent = "";
  players.forEach((playerName) => {
    const playerContainer = document.createElement("div");
    const badge = createBadge("white");
    addName(badge, playerName);
    playerContainer?.append(badge);
    waitingBoard?.append(playerContainer);
  });
};

const removeLeaveButton = () => {
  const leave = document.getElementById("leave-btn");
  leave.remove();
};

const redirectTo = (path) => {
  globalThis.location.href = path;
};

const formatTimerMessage = (timeRemaining) => {
  return `Game Starts in ... ${timeRemaining}`;
};

const showTimer = () => {
  const timer = document.querySelector("#timer");
  let timeRemaining = 5;
  const intervalId = setInterval(() => {
    timer.textContent = formatTimerMessage(timeRemaining);
    timeRemaining--;
    if (timeRemaining === 0) {
      clearInterval(intervalId);
      redirectTo("/game.html");
      return;
    }
  }, 1000);
};

const getPlayerWithRole = async () => {
  return await fetch("/game/details");
};

const renderPlayerInfo = async () => {
  const res = await getPlayerWithRole();
  const roles = await res.json();

  removeLeaveButton();
  renderPlayerRoles(roles);
  showTimer();
};

const sendLeaveLobbyReq = async () => {
  return await fetch("/lobby/room/leave", { method: "POST" });
};

const leaveLobby = async () => {
  const res = await sendLeaveLobbyReq();
  const path = await res.text();
  redirectTo(path);
};

const fetchRoomStatus = async () => {
  return await fetch("/lobby/room/status");
};

const renderRoomId = (roomId) => {
  const r = document.getElementById("room-id");
  r.textContent = `Room Id : ${roomId}`;
};

const renderPlayers = () => {
  setTimeout(async () => {
    const response = await fetchRoomStatus();
    const { players, isLobbyFull, roomId } = await response.json();
    renderRoomId(roomId);
    if (isLobbyFull) return await renderPlayerInfo(players);

    renderPlayerNames(players);
    return renderPlayers();
  }, 3000);
};

const main = () => {
  renderPlayers();
  document.querySelector("#leave-btn").addEventListener("click", leaveLobby);
};

globalThis.onload = main;
