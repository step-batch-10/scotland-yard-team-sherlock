import { Players } from "./gameManager.ts";
import {
  DetectiveStatus,
  GameStatus,
  GameStatusPlayers,
  MrxStatus,
  WinDetails,
} from "./types/gameStatus.ts";
import { MrxMove } from "./types/setupModel.ts";
import { stations } from "../../data/stations.ts";
type Ticket = "bus" | "taxi" | "black" | "underground" | "black";

interface GameMoveResponse {
  status: boolean;
  message?: string;
}

export interface Player {
  name: string;
  id: string;
  color: string;
  position: number;
}

interface MoveData {
  to: number;
  ticket: Ticket;
}

export class Game {
  #players: Players;
  #mrxMoves: MrxMove[] = [];
  #mrxRevealPositions = [3, 8, 13, 18, 24];
  #currentPlayerIndex: number = 0;
  #win?: WinDetails;

  constructor(players: Players) {
    this.#players = players;
  }

  get mrXMoves() {
    return this.#mrxMoves;
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
    };
  }

  #isStationBlockedForDetective(station: number) {
    return this.#isPlaceOccupied(station) &&
      !this.#isMrXCaught(station);
  }

  #isTurnFinished() {
    return this.#mrxMoves.length === 24;
  }

  #updateCurrentPlayerIndex() {
    this.#currentPlayerIndex = (this.#currentPlayerIndex + 1) %
      this.#players.length;
  }

  #updateto(station: number) {
    this.#players[this.#currentPlayerIndex].position = station;
  }

  #isStationReachable(ticket: Ticket, from: number, to: number): boolean {
    return stations[from][ticket].includes(to);
  }

  #isValidMove(from: number, { to, ticket }: MoveData): boolean {
    const { tickets } = this.#players[this.#currentPlayerIndex].inventory;
    const isValidTicket = (ticket in tickets) && tickets[ticket]! > 0;

    return isValidTicket && this.#isStationReachable(ticket, from, to);
  }

  move(playerId: string, moveData: MoveData): GameMoveResponse {
    const playerPosition = this.#players[this.#indexOf(playerId)].position;

    if (!this.#isValidMove(playerPosition, moveData)) {
      return { status: false, message: "Invalid move" };
    }

    return this.#move(playerId, moveData);
  }

  #updateTickets(playerId: string, ticket: Ticket) {
    const isMrX = this.#isMrX(playerId);
    const mrXtickets = this.#players[0].inventory.tickets;

    if (!isMrX) {
      const { tickets } = this.#players[this.#indexOf(playerId)].inventory;
      tickets[ticket] = tickets[ticket]! - 1;
      mrXtickets[ticket] = mrXtickets[ticket]! + 1;
      return;
    }

    mrXtickets[ticket] = mrXtickets[ticket]! - 1;
    return;
  }

  #move(playerId: string, { to, ticket }: MoveData): GameMoveResponse {
    const isMrx = this.#isMrX(playerId);

    if (!this.#isPlayerTurn(playerId)) {
      return { status: false, message: "Not Your Move ..!" };
    }

    if (isMrx) this.#mrxMoves.push({ ticket: "taxi", position: to });

    if (this.#isTurnFinished()) {
      this.#win = {
        winner: "Mr.X",
        name: this.#players[0].name,
        message: "Mr. X has evaded capture for 24 moves!",
        mrxMoves: this.#mrxMoves,
      };
    }

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

    if (this.#isStationBlockedForDetective(to)) {
      return { status: false, message: "Station already occupied ..!" };
    }

    this.#updateTickets(playerId, ticket);
    this.#updateto(to);
    this.#updateCurrentPlayerIndex();

    if (isMrx) this.#mrxMoves.push({ ticket: "taxi", position: to });

    return { status: true, message: `Moved to ${to}` };
  }

  get players() {
    return this.#players;
  }
}
