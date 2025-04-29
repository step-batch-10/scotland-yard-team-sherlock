const createImage = (isMrx) => {
  const img = document.createElement("img");
  isMrx
    ? img.setAttribute("src", "./assets/mrX_bedge.png")
    : img.setAttribute("src", "./assets/badge.png");
  img.alt = "badge";

  return img;
};

const createBadge = (color, isMrx) => {
  const badge = document.createElement("figure");
  const img = createImage(isMrx);
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
  playerContainer.classList.add("player-container");
  const badge = createBadge(color, isMrx);
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
  document.querySelectorAll("figure").forEach((fig) => {
    fig.classList.add("blinking-badge");
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
  const res = await fetch("/game/details");
  return await res.json();
};

const renderPlayerInfo = async () => {
  const roles = await getPlayerWithRole();

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

const renderPlayers = () => {
  setTimeout(async () => {
    const response = await fetchRoomStatus();
    const { players, isLobbyFull } = await response.json();
    if (isLobbyFull) return await renderPlayerInfo(players);

    renderPlayerNames(players);
    return renderPlayers();
  }, 1000);
};

const copyRoomId = () => {
  const roomId = document.getElementById("room-id").innerText;
  navigator.clipboard.writeText(roomId);

  const tooltip = document.getElementById("copy-tooltip");
  tooltip.style.display = "inline";
  setTimeout(() => {
    tooltip.style.display = "none";
  }, 1500);
};

const addClickListener = (selector, handler) => {
  const button = document.querySelector(selector);
  button.addEventListener("click", handler);
};

const main = () => {
  renderPlayers();
  addClickListener("#leave-btn", leaveLobby);
  addClickListener("#copy-btn", copyRoomId);
};

globalThis.onload = main;
