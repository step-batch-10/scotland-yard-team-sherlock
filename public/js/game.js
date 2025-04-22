const poller = () => {
  let isOver = false;

  return {
    get shouldPoll() {
      return !isOver;
    },

    stop() {
      isOver = true;
    },
  };
};

const delay = (d) => new Promise((r) => setTimeout(r, d));

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
  const playerName = document.createElement("h1");
  playerName.textContent = isYourTurn ? `You -` : `${name} -`;
  return playerName;
};

const createColorTemplate = (color) => {
  const playerColor = document.createElement("div");
  playerColor.id = "color-box";
  playerColor.style.backgroundColor = color;
  return playerColor;
};

const renderCurrentPlayerInfo = (name, color, isYourTurn) => {
  const panel = document.getElementById("info-panel");
  panel.textContent = "";
  const playerName = createNameTemplate(name, isYourTurn);
  const playerColor = createColorTemplate(color);
  panel.append(playerName, playerColor);
};

const showInventory = (div) => {
  div.style.display = "block";
};

const hideInventory = (div) => {
  div.style.display = "none";
};

const createInventoryContainer = () => {
  const div = document.createElement("div");
  div.id = "inventory-container";
  return div;
};

const positionInventoryContainer = (container, coord) => {
  container.style.padding = "10px";
  container.style.borderRadius = "10px";
  container.style.top = `${coord.top - 40}px`;
  container.style.left = `${coord.left}px`;
  container.style.backgroundColor = "white";
};

const setupInventoryHover = (pointer, container) => {
  pointer.addEventListener("mouseenter", () => showInventory(container));
  pointer.addEventListener("mouseleave", () => hideInventory(container));
};

const addInventory = (container, { tickets }) => {
  container.textContent = "";
  const taxi = document.createElement("p");
  taxi.textContent =
    `🚖:${tickets.taxi} | 🚌:${tickets.bus} | 🚇:${tickets.underground}`;
  container.append(taxi);
};

const renderInventory = (position, inventory) => {
  const map = document.getElementById("map").contentDocument;
  const pointer = map.getElementById(`pointer-${position}`);
  const coord = pointer.getBoundingClientRect();
  const inventoryContainer = createInventoryContainer();

  addInventory(inventoryContainer, inventory);
  positionInventoryContainer(inventoryContainer, coord);

  document.querySelector(".map-container")
    .append(inventoryContainer);
  setupInventoryHover(pointer, inventoryContainer);
};

const inventory = () => {
  return {
    tickets: {
      taxi: 10,
      bus: 8,
      underground: 4,
    },
    cards: {
      double: 4,
      black: 2,
    },
  };
};

const renderPlayerPositions = (map, { playerPositions, isYourTurn }) => {
  resetPointers(map);
  resetCircles(map);

  for (const { position, color, isCurrentPlayer, name } of playerPositions) {
    map.getElementById(`pointer-${position}`).setAttribute("fill", color);
    renderInventory(position, inventory());
    if (isCurrentPlayer) {
      renderCurrentPlayerInfo(name, color, isYourTurn);
      map.getElementById(`circle-${position}`).setAttribute("stroke", "white");
    }
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

globalThis.onload = async () => {
  const map = document.querySelector("object").contentDocument;
  addStationClicks(map);

  const poll = poller();

  while (poll.shouldPoll) {
    const gameStatus = await fetch("/game/status").then((res) => res.json());
    renderPlayerPositions(map, gameStatus);
    await delay(500);
  }
};
