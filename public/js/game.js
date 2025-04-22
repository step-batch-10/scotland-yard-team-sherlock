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

const createInventoryContainer = () => {
  const container = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text",
  );
  return container;
};

const createRect = () => {
  const rectangle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect",
  );
  rectangle.setAttribute("x", 16);
  rectangle.setAttribute("y", -40);
  rectangle.setAttribute("width", 80);
  rectangle.setAttribute("height", 40);
  rectangle.setAttribute("fill", "red");
  return rectangle;
};

const addInventory = (container, { tickets }, station, rect) => {
  container.innerHTML = "";
  container.setAttribute("x", "30");

  container.setAttribute("y", "-30");
  container.setAttribute("font-size", "14");
  container.setAttribute("fill", "black");
  container.textContent = `taxi: ${tickets.taxi}`;

  station.appendChild(rect);
  station.appendChild(container);
};

const renderInventory = (position, inventory) => {
  const map = document.getElementById("map").contentDocument;
  const station = map.getElementById(`station-${position}`);
  const container = createInventoryContainer();
  const rect = createRect();
  station.addEventListener("mouseenter", () => {
    addInventory(container, inventory, station, rect);
  });

  station.addEventListener("mouseleave", () => {
    if (station.contains(rect)) station.removeChild(rect);
    if (station.contains(container)) station.removeChild(container);
  });
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
