import { Players } from "./gameManager.ts";
import {
  DetectiveStatus,
  GameOverDetails,
  GameStatus,
  GameStatusPlayers,
  MrxStatus,
} from "./types/gameStatus.ts";
import { MrxMove } from "./types/setupModel.ts";

interface GameMoveResponse {
  status: boolean;
  message: string;
}

export interface Player {
  name: string;
  id: string;
  color: string;
  position: number;
}

export class Game {
  #players: Players;
  #mrxMoves: MrxMove[] = [];
  #mrxRevealPositions = [3, 8, 13, 18, 24];
  #currentPlayerIndex: number = 0;
  #gameOverDetails?: GameOverDetails;

  constructor(players: Players) {
    this.#players = players;
  }

  #isPlayerTurn(playerId: string) {
    return this.#players[this.#currentPlayerIndex].id === playerId;
  }

  #isPlaceOccupied(stationNumber: number) {
    return this.#players.some(({ position }) => stationNumber === position);
  }

  #isMrX(playerId: string): boolean {
    return this.#players[0].id === playerId;
  }

  #isMrXCaught(stationNumber: number) {
    const mrXPosition = this.#players[0].position;

    return mrXPosition === stationNumber;
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
      gameEndDetails: this.#gameOverDetails,
    };
  }

  #isStationBlockedForDetective(stationNumber: number) {
    return this.#isPlaceOccupied(stationNumber) &&
      !this.#isMrXCaught(stationNumber);
  }

  #playerMovedToSameLocation(playerId: string, stationNumber: number) {
    return this.#players[this.#indexOf(playerId)].position === stationNumber;
  }

  #isTurnFinished() {
    // we need a mechanism to save all the stations of mr. X so that we can display it when mr.x wins.
    // there can be multiple conditions of mr.X winning when we need whole log.

    return false;
  }

  move(playerId: string, stationNumber: number): GameMoveResponse {
    const isMrx = this.#isMrX(playerId);

    if (!this.#isPlayerTurn(playerId)) {
      return { status: false, message: "Not Your Move ..!" };
    }

    if (this.#playerMovedToSameLocation(playerId, stationNumber)) {
      return {
        status: false,
        message: "You should move to another station..!",
      };
    }

    if (this.#isMrXCaught(stationNumber)) {
      const playerInfo = this.#players[this.#indexOf(playerId)];

      this.#gameOverDetails = {
        detective: playerInfo!.name,
        color: playerInfo!.color,
        station: stationNumber,
      };
    }

    // here we'll check if the this.#isRevealTurn(this.#mrxMoves.length) === 24 if yes then return Mr. X finished 24 rounds and win!!
    if (this.#isTurnFinished()) {
      return { status: false, message: "game over" };
    }

    if (this.#isStationBlockedForDetective(stationNumber)) {
      return { status: false, message: "Station already occupied ..!" };
    }

    this.#players[this.#currentPlayerIndex].position = stationNumber;
    this.#currentPlayerIndex = (this.#currentPlayerIndex + 1) %
      this.#players.length;

    if (isMrx) this.#mrxMoves.push({ ticket: "taxi", position: stationNumber });

    return { status: true, message: `Moved to ${stationNumber}` };
  }

  get players() {
    return this.#players;
  }
}
