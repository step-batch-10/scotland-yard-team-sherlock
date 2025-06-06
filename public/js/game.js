const initMusic = () => {
  const music = new Audio("/assets/sherlocks_theme.mp3");
  music.loop = true;

  return music;
};

const playOnce = (music, musicToggle) => {
  if (musicToggle.checked) music.play();
  document.removeEventListener("click", playOnce);
};

const enableMusic = (music) => {
  const musicToggle = document.getElementById("musicToggle");

  document.addEventListener("click", () => playOnce(music, musicToggle));

  musicToggle.addEventListener("change", () => {
    if (musicToggle.checked) {
      music.play();
      return;
    }
    music.pause();
  });
};

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

const resetPointers = (map) => {
  const pointers = map.querySelectorAll(".pointer");
  for (const pointer of pointers) {
    pointer.setAttribute("fill", "none");
  }
};

const resetCurrentPlayerPointer = (map) => {
  const pointers = map.querySelectorAll(".pointer");
  for (const pointer of pointers) {
    pointer.setAttribute("stroke", "none");
    pointer.classList.remove("current-player");
  }
};

const renderMrx = (map, { position, color }) => {
  if (position) {
    map.getElementById(`pointer-${position}`).setAttribute("fill", color);
  }
};

const renderDetectives = (map, detectives) => {
  for (const { color, position } of detectives) {
    map.getElementById(`pointer-${position}`).setAttribute("fill", color);
  }
};

const renderPlayerPositions = (map, { players, currentPlayer }) => {
  const [mrx, ...detectives] = players;
  resetPointers(map);
  resetCurrentPlayerPointer(map);

  renderMrx(map, mrx);
  renderDetectives(map, detectives);

  const currentPlayerPosition = players[currentPlayer].position;
  if (currentPlayerPosition) {
    const pointer = map.getElementById(`pointer-${currentPlayerPosition}`);
    pointer.classList.add("current-player");
  }
};

const showPopup = () => {
  const settingBtn = document.getElementById("settingBtn");
  const settingPopup = document.getElementById("settingPopup");

  settingBtn.addEventListener("click", () => {
    settingPopup.style.display = "flex";
  });
};

const hidePopUp = () => {
  const closeSetting = document.getElementById("close-setting");
  const settingPopup = document.getElementById("settingPopup");
  const closeDetails = document.getElementById("close-details");
  const detailsPopup = document.getElementById("details");
  const closeLog = document.getElementById("close-log");
  const mrXlog = document.getElementById("log");
  closeLog.addEventListener("click", () => (mrXlog.style.display = "none"));

  closeDetails.addEventListener(
    "click",
    () => (detailsPopup.style.display = "none"),
  );

  closeSetting.addEventListener(
    "click",
    () => (settingPopup.style.display = "none"),
  );

  globalThis.addEventListener("click", (event) => {
    if (event.target === settingPopup) settingPopup.style.display = "none";
  });
};

const displayMrXLog = (mrXMoves) => {
  mrXMoves.forEach((entry, index) => {
    const ticketDiv = document.getElementById(`${index + 1}`);
    ticketDiv.innerHTML = "";

    if (entry.position) {
      const revealedSlot = document.createElement("p");
      revealedSlot.textContent = entry.position;

      revealedSlot.classList.add("reveal-station");
      ticketDiv.append(revealedSlot);
      ticketDiv.classList.add(entry.ticket);
      return;
    }

    const ticketImage = document.createElement("img");
    ticketImage.setAttribute("src", `/assets/ticket-${entry.ticket}.png`);
    ticketImage.classList.add("ticket-slot");

    ticketDiv.append(ticketImage);
  });
};

const startConfettiBurst = () => {
  const duration = 30 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 100,
      origin: { x: 0, y: Math.random() * 0.8 },
    });

    confetti({
      particleCount: 7,
      angle: 120,
      spread: 100,
      origin: { x: 1, y: Math.random() * 0.8 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

const startAshFall = () => {
  const duration = 30 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 90,
      spread: 10,
      origin: { x: Math.random(), y: 0 },
      gravity: 2,
      ticks: 200,
      scalar: 0.8,
      colors: ["#666666", "#999999", "#bbbbbb"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

const createEyeIcons = () => {
  const eye = `<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/></svg>`;

  const eyeOff =
    `<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a20.77 20.77 0 0 1 5.61-6.37"/>
      <path d="M1 1l22 22"/></svg>`;

  return { eye, eyeOff };
};

const createToggleButton = () => {
  const { eye, eyeOff } = createEyeIcons();
  const toggleBtn = document.createElement("button");
  let isVisible = false;

  toggleBtn.className = "log-toggle-button";
  toggleBtn.innerHTML = `${eye} View Mr. X's Moves`;

  toggleBtn.addEventListener("click", () => {
    if (isVisible) {
      displayLog();
      toggleBtn.innerHTML = `${eye} View Mr. X's Moves`;
    } else {
      displayLog();
      toggleBtn.innerHTML = `${eyeOff} Hide Mr. X's Moves`;
    }
    isVisible = !isVisible;
  });

  return toggleBtn;
};

const showResultPopup = ({ message }) => {
  const result = document.querySelector(".result-panel");
  const h2 = document.createElement("h2");
  const toggleBtn = createToggleButton();

  h2.className = "winner-data";
  h2.textContent = message;
  result.append(h2);

  result.append(toggleBtn);
};

const showMrXVictoryPopup = () => {
  showResultPopup({
    message:
      "You did it, Mr. X! You've escaped the Detectives' grasp once again!",
  });
};

const showDetectiveLoosePopup = () => {
  showResultPopup({
    message:
      "Better luck next time, Detectives. Mr. X slipped through your fingers today.",
  });
};

const showDetectiveWinPopup = () => {
  showResultPopup({
    message:
      "Well done, Detectives! You've tracked down Mr. X and brought him to justice!",
  });
};

const showMrXLoosePopup = (stationNumber) => {
  showResultPopup({
    message:
      `Game over, Mr. X. The Detectives have outsmarted you at station ${stationNumber}`,
  });
};

const renderMrXWin = (_, isMrX) => {
  if (isMrX) {
    showMrXVictoryPopup();
    startConfettiBurst();
    return;
  }
  showDetectiveLoosePopup();
  startAshFall();
};

const renderDetectiveWin = ({ stationNumber }, isMrX) => {
  if (isMrX) {
    showMrXLoosePopup(stationNumber);
    startAshFall();
    return;
  }
  showDetectiveWinPopup();
  startConfettiBurst();
};

const setMapZoomable = (map) => {
  const svg = map.querySelector("svg");
  svgPanZoom(svg, {
    zoomEnabled: true,
    controlIconsEnabled: true,
    fit: true,
    center: true,
    minZoom: 1,
  });
};

const renderThisPlayerPointer = (map, position) => {
  map.getElementById(`pointer-${position}`).setAttribute("stroke", "#CCE3DE");
};

const getMrxTile = (
  tileTemplate,
  { name, position, inventory },
  you,
  currentPlayer,
) => {
  const mrxTile = tileTemplate.querySelector(".mrx-tile").cloneNode(true);

  mrxTile.classList.add(you === 0 ? "your-tile" : "not-your-tile");
  if (currentPlayer === 0) mrxTile.classList.add("current-player-tile");

  mrxTile.querySelector(".player-position").textContent = position ?? "??";
  mrxTile.querySelector(".player-position").style.backgroundColor = "black";

  mrxTile.querySelector(".player-tile-name").textContent = name;

  const { taxi, bus, underground, black } = inventory.tickets;
  mrxTile.querySelector(".taxi").textContent = taxi;
  mrxTile.querySelector(".bus").textContent = bus;
  mrxTile.querySelector(".underground").textContent = underground;
  mrxTile.querySelector(".black").textContent = black;

  mrxTile.querySelector(".double").textContent = inventory.cards.doubleMove;

  return mrxTile;
};

const getDetectiveTile = (tileTemplate, detective, isYour, isCurrentPlayer) => {
  const { name, position, inventory, color } = detective;
  const detectiveTile = tileTemplate
    .querySelector(".detective-tile")
    .cloneNode(true);

  detectiveTile.classList.add(isYour ? "your-tile" : "not-your-tile");
  if (isCurrentPlayer) detectiveTile.classList.add("current-player-tile");

  detectiveTile.querySelector(".player-position").textContent = position;
  detectiveTile.querySelector(".player-position").style.backgroundColor = color;

  detectiveTile.querySelector(".player-tile-name").textContent = name;

  const { taxi, bus, underground } = inventory.tickets;
  detectiveTile.querySelector(".taxi").textContent = taxi;
  detectiveTile.querySelector(".bus").textContent = bus;
  detectiveTile.querySelector(".underground").textContent = underground;

  return detectiveTile;
};

const updatePlayerListState = (players, you, currentPlayer) => {
  const [mrx, ...detectives] = players;

  const playersList = document.querySelector(".players-list-container");
  playersList.innerHTML = "";

  const tilesTemplate = document.getElementById("player-tile-template");

  const mrxTile = getMrxTile(tilesTemplate.content, mrx, you, currentPlayer);

  playersList.append(mrxTile);

  detectives.forEach((detective, index) => {
    const detectiveTile = getDetectiveTile(
      tilesTemplate.content,
      detective,
      you === index + 1,
      currentPlayer === index + 1,
    );
    playersList.append(detectiveTile);
  });
};

const displayLog = () => {
  const travelLog = document.getElementById("log");
  if (travelLog.style.display === "flex") {
    travelLog.style.display = "none";
  } else {
    travelLog.style.display = "flex";
  }
  makeDraggable(travelLog);
};

const makeDraggable = (el) => {
  let isDragging = false;
  let offsetX, offsetY;

  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - el.getBoundingClientRect().left;
    offsetY = e.clientY - el.getBoundingClientRect().top;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      el.style.left = `${e.clientX - offsetX}px`;
      el.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });
};

const displayAllPlayers = () => {
  const playerDetails = document.getElementById("details");
  if (playerDetails.style.display === "flex") {
    playerDetails.style.display = "none";
  } else {
    playerDetails.style.display = "flex";
  }
  makeDraggable(playerDetails);
};

const displayPopups = () => {
  const music = initMusic();
  enableMusic(music);
  showPopup();
  hidePopUp();

  const logDetailsBtn = document.getElementById("log-btn");
  logDetailsBtn.addEventListener("click", displayLog);

  const playerDetailsBtn = document.getElementById("all-players");
  playerDetailsBtn.addEventListener("click", displayAllPlayers);
};

const isReqFromMrX = (index) => index === 0;

const main = async () => {
  displayPopups();
  const map = document.querySelector("object").contentDocument;
  const poll = poller();

  setMapZoomable(map);

  const myState = new StationState();

  while (poll.shouldPoll) {
    const gameStatus = await fetch("/game/status").then((res) => res.json());

    displayMrXLog(gameStatus.mrXMoves);
    myState.updateState(
      gameStatus.you,
      gameStatus.currentPlayer,
      gameStatus.stations,
      gameStatus.players[gameStatus.you].inventory.cards,
    );

    if (gameStatus.win) {
      const gameEndPopup = document.getElementById("game-end-popup");
      gameEndPopup.style.display = "flex";

      const isMrX = isReqFromMrX(gameStatus.you);

      gameStatus.win.winner === "Mr.X"
        ? renderMrXWin(gameStatus.win, isMrX)
        : renderDetectiveWin(gameStatus.win, isMrX);

      document.getElementById("overlay").style.display = "block";
      poll.stop();
    }

    renderPlayerPositions(map, gameStatus);

    updatePlayerListState(
      gameStatus.players,
      gameStatus.you,
      gameStatus.currentPlayer,
    );

    renderThisPlayerPointer(map, gameStatus.players[gameStatus.you].position);
    await poll.delay();
  }
};

globalThis.onload = main;

class StationState {
  #map = document.getElementById("map").contentDocument;
  #isDoubleUsed = false;
  #stations;

  #getPossibleStations() {
    return [...new Set(Object.values(this.#stations).flat())];
  }

  #getPossibleModes(stationNumber) {
    return Object.entries(this.#stations).reduce(
      (availableModes, [mode, stations]) => {
        if (stations.includes(stationNumber)) {
          availableModes.push(mode);
        }
        return availableModes;
      },
      [],
    );
  }

  #showToast(message, color) {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: color,
      stopOnFocus: true,
    }).showToast();
  }

  async #sendMoveReq(to, ticket) {
    const response = await fetch("/game/move", {
      method: "POST",
      body: JSON.stringify({ to, ticket, isDoubleUsed: this.#isDoubleUsed }),
    });

    return response;
  }

  async #makeMove(to, ticket) {
    const resp = await this.#sendMoveReq(to, ticket);

    const { message } = await resp.json();

    if (resp.status === 403) {
      return this.#showToast(message, "#EB6649");
    }

    this.#showToast(message, "#63a4ff");
  }

  #closeTicketInfoContainer(station) {
    const ticketInfoContainer = document.querySelector(
      `#ticket-info-container-${station}`,
    );
    if (ticketInfoContainer) ticketInfoContainer.remove();
  }

  #ticketInfoContainerCloseButton(station) {
    const closeButton = document.createElement("button");

    closeButton.classList.add("ticket-info-close-button");
    closeButton.innerText = "X";
    closeButton.onclick = () => this.#closeTicketInfoContainer(station);

    return closeButton;
  }

  #addTransportModes(station, possibleStations, ticketInfoContainer) {
    possibleStations.forEach((transport) => {
      const transportElement = document.createElement("img");
      transportElement.classList.add(
        `ticket-info-element`,
        `transport-${transport}`,
      );
      transportElement.setAttribute("src", `/assets/ticket-${transport}.png`);

      transportElement.onclick = () => {
        this.#makeMove(station, transport);
        this.#closeTicketInfoContainer(station);
      };

      ticketInfoContainer.appendChild(transportElement);
    });
  }

  #onDoubleButtonClick(doubleButton) {
    this.#isDoubleUsed = !this.#isDoubleUsed;
    if (this.#isDoubleUsed) doubleButton.classList.add("double-used");
    else doubleButton.classList.remove("double-used");
  }

  #addDoubleButton(ticketContainer) {
    const doubleButton = document.createElement("button");
    doubleButton.innerText = "2X";
    doubleButton.classList.add("double-button");

    doubleButton.onclick = () => this.#onDoubleButtonClick(doubleButton);

    ticketContainer.appendChild(doubleButton);
  }

  #createTicketInfoContainer(station, possibleStations, doubleCards) {
    const ticketInfoContainer = document.createElement("div");
    ticketInfoContainer.classList.add("ticket-info-container");
    ticketInfoContainer.id = `ticket-info-container-${station}`;

    this.#addTransportModes(station, possibleStations, ticketInfoContainer);

    this.#isDoubleUsed = false;
    if (doubleCards && doubleCards.doubleMove > 0) {
      this.#addDoubleButton(ticketInfoContainer);
    }

    ticketInfoContainer.appendChild(
      this.#ticketInfoContainerCloseButton(station),
    );

    return ticketInfoContainer;
  }

  #showTicketInfo(station, doubleCards) {
    const possibleStations = this.#getPossibleModes(station);
    const ticketInfoContainer = this.#createTicketInfoContainer(
      station,
      possibleStations,
      doubleCards,
    );

    const clickedStation = this.#map.querySelector(`#station-${station}`);
    const position = clickedStation.getBoundingClientRect();

    ticketInfoContainer.style.top = `${position.top + 40}px`;
    ticketInfoContainer.style.left = `${
      position.left - 300 + globalThis.scrollX
    }px`;

    document.body.appendChild(ticketInfoContainer);
  }

  #addStationClickListener(stations, doubleCards) {
    stations.forEach((station) => {
      const stationElement = this.#map.querySelector(`#station-${station}`);
      stationElement.onclick = () => this.#showTicketInfo(station, doubleCards);
    });
  }

  #resetStationPointers() {
    this.#map.querySelectorAll(".circle").forEach((station) => {
      station.setAttribute("stroke", "none");
    });
  }

  #resetStationListeners() {
    this.#map.querySelectorAll(".station").forEach((station) => {
      station.onclick = () => {};
    });
  }

  #renderStationPointers(isYourTurn, doubleCards) {
    if (isYourTurn) {
      const possibleStations = this.#getPossibleStations();
      possibleStations.forEach((station) => {
        const stationElement = this.#map.querySelector(`#circle-${station}`);
        stationElement.setAttribute("stroke", "white");
      });

      this.#addStationClickListener(possibleStations, doubleCards);
    }
  }

  updateState(you, current, stations, doubleCards) {
    this.#resetStationPointers();
    this.#resetStationListeners();
    this.#stations = stations;

    this.#renderStationPointers(current === you, doubleCards);

    const googleMapBg = this.#map.querySelector("#google-map-bg");
    googleMapBg.style.display = current === you ? "inline" : "none";
  }
}
