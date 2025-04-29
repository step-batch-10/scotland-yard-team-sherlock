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

const createInventoryContainer = () => {
  const div = document.createElement("div");
  div.className = "inventory-container";
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
  const container = document.createElement("p");
  container.style.textAlign = "center";
  container.textContent = content;
  return container;
};

const createTicketPanel = (ticket, count) => {
  const panel = document.createElement("div");
  panel.id = "ticket-panel";

  const ticketContainer = createContainer(ticket);
  const countContainer = createContainer(count);

  panel.append(ticketContainer, countContainer);
  return panel;
};

const renderInventoryPanel = (inventory, container) => {
  const inventoryPanel = document.createElement("div");
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

const renderPlayerPositions = (map, { players, currentPlayer }) => {
  const [mrx, ...detectives] = players;
  resetPointers(map);
  resetCurrentPlayerPointer(map);

  document.querySelectorAll(".inventory-container").forEach((e) => e.remove());
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
  const popup = document.getElementById("popup");
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
    if (event.target === popup) popup.style.display = "none";

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

const createElement = (tag, className) => {
  const ele = document.createElement(tag);
  ele.className = className;

  return ele;
};

const renderMrXWin = (winDetails) => {
  const result = document.getElementById("result-panel");
  const h2 = document.createElement("h2");
  h2.className = "winner-data";
  h2.textContent = `Winner : ${winDetails.winner}!!🥳`;
  const name = document.createElement("span");
  name.className = "player-name";
  name.textContent = `Name : ${winDetails.name}`;

  const logContainer = createElement("div", "win-log");

  for (const { ticket, position } of winDetails.mrxMoves) {
    const ticketDiv = createElement("div", "log-entries");

    ticketDiv.classList.add(ticket);
    const pTag = document.createElement("p");
    pTag.textContent = position;
    ticketDiv.appendChild(pTag);
    logContainer.appendChild(ticketDiv);
  }

  result.append(logContainer, h2, name);
};

const renderDetectiveWin = (winDetails) => {
  const result = document.getElementById("result-panel");
  const h2 = document.createElement("h2");
  h2.className = "winner-data";
  h2.textContent = `Winner : ${winDetails.winner}!!🥳`;
  const name = document.createElement("span");
  name.classList.add("player-name");
  name.textContent = `Caught By : ${winDetails.name}`;
  name.style.backgroundColor = winDetails.color;
  const stationInfo = document.createElement("h3");
  stationInfo.textContent = `At Station number - ${winDetails.stationNumber}`;
  stationInfo.classList.add("station-info");
  result.append(h2, name, stationInfo);
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
      const gameEndPopup = document.getElementById("popup");
      gameEndPopup.style.display = "flex";
      gameStatus.win.winner === "Mr.X"
        ? renderMrXWin(gameStatus.win)
        : renderDetectiveWin(gameStatus.win);

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
