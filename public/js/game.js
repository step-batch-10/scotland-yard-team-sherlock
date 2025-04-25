const poller = () => {
  let isOver = false;

  return {
    get shouldPoll() {
      return !isOver;
    },

    stop() {
      isOver = true;
    },

    async delay() {
      await delay(1000);
    },
  };
};

const delay = (d) => new Promise((r) => setTimeout(r, d));
const createElement = (tag, className) => {
  const ele = document.createElement(tag);
  ele.classList.add(className);
  return ele;
};

const resetPointers = (map) => {
  const pointers = map.querySelectorAll(".pointer");
  for (const pointer of pointers) {
    pointer.setAttribute("fill", "none");
  }
};

const resetCircles = (map) => {
  const circles = map.querySelectorAll(".circle");
  for (const circle of circles) {
    circle.setAttribute("stroke", "none");
  }
};

const createNameTemplate = (name, isYourTurn) => {
  const playerName = createElement("h1");
  playerName.textContent = isYourTurn ? `You -` : `${name} -`;
  return playerName;
};

const createColorTemplate = (color) => {
  const playerColor = createElement("div");
  playerColor.id = "color-box";
  playerColor.style.backgroundColor = color;
  return playerColor;
};

const renderCurrentPlayerInfo = ({ name, color }, isYourTurn) => {
  const panel = document.getElementById("info-panel");
  panel.textContent = "";
  const playerName = createNameTemplate(name, isYourTurn);
  const playerColor = createColorTemplate(color);
  panel.append(playerName, playerColor);
};

const createInventoryContainer = () => {
  const div = createElement("div");
  div.id = "inventory-container";
  return div;
};

const positionInventoryContainer = (container, coord) => {
  container.style.top = `${coord.top - 40}px`;
  container.style.left = `${coord.left}px`;
};

const toggleDisplay = (el, show) => {
  el.style.display = show ? "flex" : "none";
};

const addHoverListener = (triggerEl, targetEl) => {
  triggerEl.addEventListener("mouseover", () => toggleDisplay(targetEl, true));
  triggerEl.addEventListener("mouseout", () => toggleDisplay(targetEl, false));
};

const createContainer = (content) => {
  const container = createElement("p");
  container.style.textAlign = "center";
  container.textContent = content;
  return container;
};

const createTicketPanel = (ticket, count) => {
  const panel = createElement("div");
  panel.id = "ticket-panel";

  const ticketContainer = createContainer(ticket);
  const countContainer = createContainer(count);

  panel.append(ticketContainer, countContainer);
  return panel;
};

const renderInventoryPanel = (inventory, container) => {
  const inventoryPanel = createElement("div");
  inventoryPanel.id = "inventory-panel";
  inventoryPanel.style.display = "flex";

  for (const [ticket, count] of Object.entries(inventory)) {
    if (!count) continue;
    const panel = createTicketPanel(ticket, count);
    inventoryPanel.append(panel);
  }

  container.append(inventoryPanel);
  addHoverListener(container, container);
};

const addInventory = (inventoryContainer, { tickets, cards }) => {
  inventoryContainer.textContent = "";
  renderInventoryPanel(tickets, inventoryContainer);
  if (cards) renderInventoryPanel(cards, inventoryContainer);
};

const renderInventory = (position, inventory) => {
  const map = document.getElementById("map").contentDocument;
  const pointer = map.getElementById(`pointer-${position}`);
  const coord = pointer.getBoundingClientRect();
  const inventoryContainer = createInventoryContainer();

  addInventory(inventoryContainer, inventory);
  positionInventoryContainer(inventoryContainer, coord);

  document.querySelector(".map-container").append(inventoryContainer);
  addHoverListener(pointer, inventoryContainer);
};

const renderMrx = (map, { position, color, inventory }) => {
  if (position) {
    renderInventory(position, inventory);
    map.getElementById(`pointer-${position}`).setAttribute("fill", color);
  }
};

const renderDetectives = (map, detectives) => {
  for (const { color, position, inventory } of detectives) {
    renderInventory(position, inventory);
    map.getElementById(`pointer-${position}`).setAttribute("fill", color);
  }
};

const renderPlayerPositions = (map, { players, currentPlayer, you }) => {
  const [mrx, ...detectives] = players;

  resetPointers(map);
  resetCircles(map);

  renderMrx(map, mrx);
  renderDetectives(map, detectives);

  renderCurrentPlayerInfo(players[currentPlayer], you === currentPlayer);

  const currentPlayerPosition = players[currentPlayer].position;
  if (currentPlayerPosition) {
    const circle = map.getElementById(`circle-${currentPlayerPosition}`);
    circle.setAttribute("stroke", "black");
  }
};

const showToast = (message, color) => {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: color,
    stopOnFocus: true,
  }).showToast();
};

const sendMoveReq = async (stationNumber) => {
  const response = await fetch("/game/move", {
    method: "POST",
    body: JSON.stringify({ stationNumber }),
  });

  return response;
};

const makeMove = async (stationNumber) => {
  const resp = await sendMoveReq(stationNumber);

  const { message } = await resp.json();

  if (resp.status === 403) {
    return showToast(message, "red");
  }

  showToast(message, "blue");
};

const addStationClicks = (map) => {
  const stations = map.querySelectorAll(".station");
  for (const station of stations) {
    station.onclick = async () => {
      const stationNumber = parseInt(station.id.split("-")[1]);
      await makeMove(stationNumber);
    };
  }
};

const hidePopUp = () => {
  const popup = document.getElementById("popup");
  const closeBtn = document.querySelector(".close");

  closeBtn.addEventListener("click", () => (popup.style.display = "none"));

  globalThis.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.style.display = "none";
    }
  });
};

const displayMrXLog = (mrXMoves) => {
  mrXMoves.forEach((entry, index) => {
    const ticketDiv = document.getElementById(`${index + 1}`);
    const pTag = ticketDiv.querySelector("p");
    pTag.textContent = entry.position ? entry.position : entry.ticket;

    pTag.classList.add("reveal-station");

    ticketDiv.classList.add(entry.ticket);
  });
};

const renderMrXWin = (winDetails) => {
  const result = document.getElementById("result-panel");
  const h2 = createElement("h2", "winner-data");
  h2.textContent = `Winner : ${winDetails.winner}!!🥳`;
  const name = createElement("span", "player-name");
  name.textContent = `Name : ${winDetails.name}`;

  // const logContainer = createElement("div", "win-log");
  // for (let i = 1; i <= 24; i++) {
  //   const ticketDiv = createElement("div", "log-entries");
  //   ticketDiv.id = i.toString();
  //   const pTag = document.createElement("p");
  //   pTag.textContent = "33";
  //   ticketDiv.appendChild(pTag);

  //   logContainer.appendChild(ticketDiv);
  // }

  result.append(h2, name);
};

const renderDetectiveWin = (winDetails) => {
  const result = document.getElementById("result-panel");
  const h2 = createElement("h2", "winner-data");
  h2.textContent = `Winner : ${winDetails.winner}!!🥳`;
  const name = createElement("span", "player-name");
  name.textContent = `Caught By : ${winDetails.name}`;
  name.style.backgroundColor = winDetails.color;
  const stationInfo = createElement("h3");
  stationInfo.textContent = `At Station number - ${winDetails.stationNumber}`;
  stationInfo.classList.add("station-info");
  result.append(h2, name, stationInfo);
};

const main = async () => {
  const map = document.querySelector("object").contentDocument;
  const poll = poller();

  addStationClicks(map);

  while (poll.shouldPoll) {
    const gameStatus = await fetch("/game/status").then((res) => res.json());

    displayMrXLog(gameStatus.mrXMoves);

    if (gameStatus.win) {
      const gameEndPopup = document.getElementById("popup");
      gameEndPopup.style.display = "flex";
      gameStatus.win.winner === "Mr.X"
        ? renderMrXWin(gameStatus.win)
        : renderDetectiveWin(gameStatus.win);

      document.getElementById("overlay").style.display = "block";
      poll.stop();
    }

    renderPlayerPositions(map, gameStatus);
    await poll.delay();
  }

  hidePopUp();
};

globalThis.onload = main;
