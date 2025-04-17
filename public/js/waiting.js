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
  playerContainer.append(figure);
};

const renderPlayerRoles = (playersInfo) => {
  playersInfo.forEach((playerInfo, index) => {
    const playerContainer = document.querySelector(`#player-${index}`);
    addToWaitingBoard(playerContainer, playerInfo);
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
  players.forEach((playerName, index) => {
    const playerContainer = document.querySelector(`#player-${index}`);
    const figure = document.createElement("figure");
    addBadge(figure, "white");
    addName(figure, playerName);
    playerContainer.append(figure);
  });
};

const main = async () => {
  const response = await fetch("/fetch-players");
  const { players, isLobbyFull } = await response.json();

  if (isLobbyFull) {
    const res = await fetch("/assign-roles");
    const roles = await res.json();
    renderPlayerRoles(roles);
    return;
  }
  renderPlayerNames(players);
  return;
};

globalThis.onload = main;
