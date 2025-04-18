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

const renderCurrentPlayerInfo = (name, color) => {
  const panel = document.getElementById("info-panel");
  panel.textContent = "";
  const playerName = document.createElement("h1");
  playerName.textContent = `${name} -`;
  const playerColor = document.createElement("div");
  playerColor.id = "color-box";
  playerColor.style.backgroundColor = color;
  panel.append(playerName, playerColor);
};

const renderPlayerPositions = (map, playerPositions) => {
  resetPointers(map);
  resetCircles(map);

  for (const { position, color, isCurrentPlayer, name } of playerPositions) {
    map.getElementById(`pointer-${position}`).setAttribute("fill", color);
    if (isCurrentPlayer) {
      renderCurrentPlayerInfo(name, color);
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

const makeMove = async (stationNumber) => {
  const resp = await fetch("/game/move", {
    method: "POST",
    body: JSON.stringify({ stationNumber }),
  });

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
    renderPlayerPositions(map, gameStatus.playerPositions);
    await delay(500);
  }
};
