const addBadge = (figure, color) => {
  const img = document.createElement("img");
  img.setAttribute("src", "./assets/badgeImg.png");
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

const redirectTo = (path) => {
  globalThis.location.href = path;
};

const startCountdown = (initialTime, updateDisplay) => {
  const intervalId = setInterval(() => {
    initialTime--;
    updateDisplay(initialTime);
    if (initialTime <= 0) clearInterval(intervalId);
  }, 1000);
};

const formatTimerMessage = (timeRemaining) => {
  return timeRemaining > 0
    ? `Game Starts in ... ${timeRemaining}`
    : "Game Starting!";
};

const showTimer = () => {
  const footer = document.querySelector("footer");
  const timerDisplay = document.createElement("h1");

  footer.append(timerDisplay);

  const updateDisplay = (timeRemaining) => {
    timerDisplay.textContent = formatTimerMessage(timeRemaining);
    if (timeRemaining === 0) redirectTo("/game.html");
  };

  startCountdown(5, updateDisplay);
};

const getPlayerWithRole = async () => {
  return await fetch("/assign-roles");
};

const renderPlayerInfo = async () => {
  const res = await getPlayerWithRole();
  const roles = await res.json();

  removeLeaveButton();
  renderPlayerRoles(roles);
  showTimer();
};

const sendLeaveLobbyReq = async () => {
  return await fetch("/leave-lobby", { method: "POST" });
};

const leaveLobby = async () => {
  const res = await sendLeaveLobbyReq();
  const path = await res.text();
  redirectTo(path);
};

const getAllPlayers = async () => {
  return await fetch("/fetch-players");
};

const renderPlayers = () => {
  setTimeout(async () => {
    const response = await getAllPlayers();
    const { players, isLobbyFull } = await response.json();

    if (isLobbyFull) return await renderPlayerInfo(players);

    renderPlayerNames(players);
    return renderPlayers();
  }, 500);
};

const main = () => {
  renderPlayers();
  document.querySelector("#leave-btn")
    .addEventListener("click", leaveLobby);
};

globalThis.onload = main;
