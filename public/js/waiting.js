const addBadge = (figure, color) => {
  const img = document.createElement("img");
  img.setAttribute("src", "./assets/badge.jpeg");
  img.alt = "badge";
  img.style.border = `6px solid ${color}`;
  figure?.append(img);
};

const addCaption = (playerContainer, name, role) => {
  const figcaption = document.createElement("figcaption");
  figcaption.textContent = `${name} : ${role}`;

  playerContainer?.append(figcaption);
};

const addToWaitingBoard = (playerContainer, { name, role, color }) => {
  const figure = document.createElement("figure");
  addBadge(figure, color);
  addCaption(figure, name, role);
  playerContainer?.append(figure);
};

const renderPlayerRoles = (playersInfo) => {
  const waitingBoard = document.querySelector("#waiting-board");
  waitingBoard.textContent = "";

  playersInfo.forEach((playerInfo) => {
    const playerContainer = document.createElement("div");
    addToWaitingBoard(playerContainer, playerInfo);
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
    const figure = document.createElement("figure");
    addBadge(figure, "white");
    addName(figure, playerName);
    playerContainer?.append(figure);
    waitingBoard?.append(playerContainer);
  });
};

const removeLeaveButton = () => {
  const leave = document.getElementById("leave-btn");
  leave.remove();
};

const renderTimer = () => {
  const footer = document.querySelector("footer");
  const h1 = document.createElement("h1");
  footer.append(h1);
  let timeRemaining = 10;

  const intervalId = setInterval(() => {
    h1.textContent = `Game Starts in ... ${timeRemaining}`;
    timeRemaining--;
    if (timeRemaining === 0) {
      clearInterval(intervalId);
      globalThis.location.href = "/game.html";
    }
  }, 1000);
};

const renderPlayerInfo = async () => {
  const res = await fetch("/assign-roles");
  const roles = await res.json();
  removeLeaveButton();
  renderTimer();
  renderPlayerRoles(roles);
};

const leaveLobby = async () => {
  const res = await fetch("/leave-lobby", { method: "POST" });
  const path = await res.text();
  globalThis.location.href = path;
};

const renderPlayers = () => {
  setTimeout(async () => {
    const response = await fetch("/fetch-players");
    const { players, isLobbyFull } = await response.json();

    if (isLobbyFull) return await renderPlayerInfo(players);

    renderPlayerNames(players);
    return renderPlayers();
  }, 500);
};

const main = () => {
  renderPlayers();
  const leaveBtn = document.querySelector("#leave-btn");
  leaveBtn.addEventListener("click", leaveLobby);
};

globalThis.onload = main;
