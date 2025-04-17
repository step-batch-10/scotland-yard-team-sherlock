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
  setTimeout(() => {
    globalThis.location.href = "index.html";
  }, 5000);
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

const main = () => {
  const intervalId = setInterval(async () => {
    const response = await fetch("/fetch-players");
    const { players, isLobbyFull } = await response.json();

    if (isLobbyFull) {
      const res = await fetch("/assign-roles");
      const roles = await res.json();
      renderPlayerNames(players);
      renderPlayerRoles(roles);
      clearInterval(intervalId);
      return;
    }
    renderPlayerNames(players);
    return;
  }, 1000);
};

globalThis.onload = main;
