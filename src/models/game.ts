import { Players } from "./gameManager.ts";
import {
  DetectiveStatus,
  GameMoveResponse,
  GameStatus,
  GameStatusPlayers,
  MrxStatus,
  TicketsStatus,
  WinDetails,
} from "./types/gameStatus.ts";
import { MrxMove } from "./types/setupModel.ts";
import { stations } from "../../data/stations.ts";
type Ticket = "bus" | "taxi" | "black" | "underground" | "black";

export interface Player {
  name: string;
  id: string;
  color: string;
  position: number;
}

export interface MoveData {
  to: number;
  ticket: Ticket;
  isDoubleUsed?: boolean;
}

export class Game {
  #players: Players;
  #mrxMoves: MrxMove[] = [];
  #mrxRevealPositions = [3, 8, 13, 18, 24];
  #currentPlayerIndex: number = 0;
  #win?: WinDetails;
  #wasDoubleUsed: boolean = false;

  constructor(players: Players) {
    this.#players = players;
  }

  get currentPlayer() {
    return this.#currentPlayerIndex;
  }

  #isPlayerTurn(playerId: string) {
    return this.#players[this.#currentPlayerIndex].id === playerId;
  }

  #isPlaceOccupied(station: number) {
    return this.#players.some(({ position }) => station === position);
  }

  #isMrX(playerId: string): boolean {
    return this.#players[0].id === playerId;
  }

  #isMrXCaught(station: number) {
    const mrXPosition = this.#players[0].position;

    return mrXPosition === station;
  }

  #isRevealTurn(round: number) {
    return this.#mrxRevealPositions.includes(round);
  }

  #mrXStatus(playerId: string) {
    const isMrx = this.#isMrX(playerId);

    const isRevealTurn = this.#isRevealTurn(this.#mrxMoves.length);
    const mrxStatus: MrxStatus = {
      ...this.#players[0],
      position: isMrx || isRevealTurn ? this.#players[0].position : undefined,
    };
    return mrxStatus;
  }

  #indexOf(playerId: string) {
    return this.#players.findIndex(({ id }) => id === playerId);
  }

  #getPossibleStations(player: MrxStatus | DetectiveStatus) {
    const tickets: TicketsStatus = player.inventory.tickets;
    const position = player.position!;
    const adjacentStations = stations[position];

    const possibleStations = Object
      .entries(adjacentStations)
      .filter(([vehicle, stations]) =>
        stations.length > 0 && tickets[vehicle as Ticket]! > 0
      );

    return Object.fromEntries(possibleStations);
  }

  gameStatus(playerId: string): GameStatus {
    const mrxStatus = this.#mrXStatus(playerId);
    const detectives = this.#players.slice(1, 6) as DetectiveStatus[];

    return {
      players: [mrxStatus, ...detectives] as GameStatusPlayers,
      mrXMoves: this.#mrxMoves.map(
        ({ ticket, position }, index) => {
          const isRevealTurn = this.#isRevealTurn(index + 1);
          return { ticket, position: isRevealTurn ? position : undefined };
        },
      ),

      you: this.#indexOf(playerId),
      currentPlayer: this.#currentPlayerIndex,
      win: this.#win,
      stations: this.#getPossibleStations(
        this.#players[this.#indexOf(playerId)],
      ),
    };
  }

  #isStationBlockedForDetective(station: number) {
    return this.#isPlaceOccupied(station) &&
      !this.#isMrXCaught(station);
  }

  #isTurnFinished() {
    return this.#mrxMoves.length === 24;
  }

  #updateCurrentPlayerIndex(isDoubleUsed: boolean | undefined) {
    if (!isDoubleUsed) {
      this.#currentPlayerIndex = (this.#currentPlayerIndex + 1) %
        this.#players.length;
    }
  }

  #updateTo(station: number) {
    this.#players[this.#currentPlayerIndex].position = station;
  }

  #isStationReachable(ticket: Ticket, from: number, to: number): boolean {
    return stations[from][ticket].includes(to);
  }

  #isValidDoubleMove({ isDoubleUsed }: MoveData) {
    if (isDoubleUsed && this.#wasDoubleUsed) return false;
    if (isDoubleUsed && !this.#wasDoubleUsed) {
      this.#wasDoubleUsed = true;
      return true;
    }
    return true;
  }

  #isValidMove(from: number, { to, ticket }: MoveData): boolean {
    const { tickets } = this.#players[this.#currentPlayerIndex].inventory;
    const isValidTicket = (ticket in tickets) && tickets[ticket]! > 0;

    return isValidTicket &&
      this.#isStationReachable(ticket, from, to);
  }

  move(playerId: string, moveData: MoveData): GameMoveResponse {
    const playerPosition = this.#players[this.#indexOf(playerId)].position;

    if (!this.#isPlayerTurn(playerId)) {
      return { status: false, message: "Not Your Move ..!" };
    }
    if (!this.#isValidDoubleMove(moveData)) {
      return {
        status: false,
        message: "You can't use double move card again",
      };
    }
    if (!this.#isValidMove(playerPosition, moveData)) {
      return { status: false, message: "Invalid move" };
    }

    if (this.#isStationBlockedForDetective(moveData.to)) {
      return { status: false, message: "Station already occupied ..!" };
    }

    return this.#move(playerId, moveData);
  }

  #updateTickets(playerId: string, ticket: Ticket) {
    const isMrX = this.#isMrX(playerId);
    const mrXTickets = this.#players[0].inventory.tickets;

    if (!isMrX) {
      const { tickets } = this.#players[this.#indexOf(playerId)].inventory;
      tickets[ticket] = tickets[ticket]! - 1;
      mrXTickets[ticket] = mrXTickets[ticket]! + 1;
      return;
    }

    mrXTickets[ticket] = mrXTickets[ticket]! - 1;
    return;
  }

  #isArraySame(array1: number[], array2: number[]) {
    const setA = new Set(array1);
    const setB = new Set(array2);

    for (const value of setA) {
      if (!setB.has(value)) return false;
    }
    return true;
  }

  #isMrXBlocked(): boolean {
    const [mrXLocation, ...allDetectiveLocations] = this.#players.map((
      { position },
    ) => position);
    const mrXPossLoc = stations[mrXLocation];
    const mrXPossibleStations = Object.values(mrXPossLoc).flat();

    return this.#isArraySame(mrXPossibleStations, allDetectiveLocations);
  }

  #move(
    playerId: string,
    { to, ticket, isDoubleUsed }: MoveData,
  ): GameMoveResponse {
    const isMrx = this.#isMrX(playerId);

    if (isMrx) this.#mrxMoves.push({ ticket, position: to });

    if (this.#isMrXCaught(to)) {
      const playerInfo = this.#players[this.#indexOf(playerId)];

      this.#win = {
        winner: "Detective",
        color: playerInfo.color,
        stationNumber: to,
        name: playerInfo.name,
        message: "detective won",
      };
    }

    this.#updateTickets(playerId, ticket);
    this.#updateTo(to);
    this.#updateCurrentPlayerIndex(isDoubleUsed);

    if (this.#isTurnFinished()) {
      this.#win = {
        winner: "Mr.X",
        name: this.#players[0].name,
        message: "Mr. X has evaded capture for 24 moves!",
        mrxMoves: this.#mrxMoves,
      };
    }

    if (this.#isMrXBlocked()) {
      this.#win = {
        winner: "Detective",
        message: "Mr.X got blocked by Detectives",
      };
    }
    return { status: true, message: `Moved to ${to}` };
  }

  get players() {
    return this.#players;
  }
}
