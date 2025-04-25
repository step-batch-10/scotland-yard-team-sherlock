// class MyOwn {
//   #map = document.getElementById("map").contentDocument;
//   #stations;

//   #getPossibleStations() {
//     return [
//       ...new Set([
//         ...this.#stations.taxi,
//         ...this.#stations.bus,
//         ...this.#stations.underground,
//       ]),
//     ];
//   }

//   #getPossibleModes(stationNumber) {
//     return Object.entries(this.#stations).reduce(
//       (availableModes, [mode, stations]) => {
//         if (stations.includes(stationNumber)) {
//           availableModes.push(mode);
//         }
//         return availableModes;
//       },
//       [],
//     );
//   }

//   #showToast(message, color) {
//     Toastify({
//       text: message,
//       duration: 3000,
//       gravity: "top",
//       position: "right",
//       backgroundColor: color,
//       stopOnFocus: true,
//     }).showToast();
//   }

//   async #sendMoveReq(to, ticket) {
//     const response = await fetch("/game/move", {
//       method: "POST",
//       body: JSON.stringify({ to, ticket }),
//     });

//     return response;
//   }

//   async #makeMove(to, ticket) {
//     const resp = await this.#sendMoveReq(to, ticket);

//     const { message } = await resp.json();

//     if (resp.status === 403) {
//       return this.#showToast(message, "red");
//     }

//     this.#showToast(message, "blue");
//   }

//   #closeTicketInfoContainer(station) {
//     const ticketInfoContainer = document.querySelector(
//       `#ticket-info-container-${station}`,
//     );
//     if (ticketInfoContainer) ticketInfoContainer.remove();
//   }

//   #ticketInfoContainerCloseButton(station) {
//     const closeButton = document.createElement("button");

//     closeButton.classList.add("ticket-info-close-button");
//     closeButton.innerText = "X";
//     closeButton.onclick = () => this.#closeTicketInfoContainer(station);

//     return closeButton;
//   }

//   #createTicketInfoContainer(station, possibleStations, isYourTurn) {
//     const ticketInfoContainer = document.createElement("div");
//     ticketInfoContainer.classList.add("ticket-info-container");
//     ticketInfoContainer.id = `ticket-info-container-${station}`;

//     possibleStations.forEach((transport) => {
//       const transportElement = document.createElement("div");
//       transportElement.classList.add("ticket-info-element");
//       transportElement.innerText = transport;

//       transportElement.onclick = () => {
//         if (!isYourTurn) {
//           this.#showToast("It's not your turn", "red");
//           return;
//         }

//         this.#makeMove(station, transport);
//         this.#closeTicketInfoContainer(station);
//       };

//       ticketInfoContainer.appendChild(transportElement);
//     });

//     ticketInfoContainer.appendChild(
//       this.#ticketInfoContainerCloseButton(station),
//     );

//     return ticketInfoContainer;
//   }

//   #showTicketInfo(station, isYourTurn) {
//     const possibleStations = this.#getPossibleModes(station);
//     const ticketInfoContainer = this.#createTicketInfoContainer(
//       station,
//       possibleStations,
//       isYourTurn,
//     );

//     const clickedStation = this.#map.querySelector(`#station-${station}`);
//     const position = clickedStation.getBoundingClientRect();

//     ticketInfoContainer.style.top = `${position.top + 40}px`;
//     ticketInfoContainer.style.left = `${
//       position.left - 300 + globalThis.scrollX
//     }px`;

//     document.body.appendChild(ticketInfoContainer);
//   }

//   #addStationClickListener(stations, isYourTurn) {
//     stations.forEach((station) => {
//       const stationElement = this.#map.querySelector(`#station-${station}`);
//       stationElement.onclick = () => this.#showTicketInfo(station, isYourTurn);
//     });
//   }

//   #resetStationPointers() {
//     this.#map.querySelectorAll(".circle").forEach((station) => {
//       station.setAttribute("stroke", "none");
//     });
//   }

//   #renderStationPointers(stations, isYourTurn) {
//     stations.forEach((station) => {
//       const stationElement = this.#map.querySelector(`#circle-${station}`);
//       stationElement.setAttribute("stroke", "white");
//     });

//     this.#addStationClickListener(stations, isYourTurn);
//   }

//   updateState(you, current, stations) {
//     this.#resetStationPointers();

//     this.#stations = stations;

//     this.#renderStationPointers(this.#getPossibleStations(), current === you);
//   }
// }
