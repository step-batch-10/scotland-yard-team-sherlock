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

  gameStatus(playerId: string): GameStatus {
    const isMrx = this.#isMrX(playerId);

    const isRevealTurn = this.#mrxRevealPositions.includes(
      this.#mrxMoves.length,
    );
    const mrxStatus: MrxStatus = {
      ...this.#players[0],
      position: isMrx || isRevealTurn ? this.#players[0].position : undefined,
    };

    const detectives = this.#players.slice(1, 6) as DetectiveStatus[];

    return {
      players: [mrxStatus, ...detectives] as GameStatusPlayers,
      mrXMoves: this.#mrxMoves.map(
        ({ ticket, position }, index) => {
          const isRevealTurn = this.#mrxRevealPositions.includes(index + 1);
          return {
            ticket,
            position: isRevealTurn ? position : undefined,
          };
        },
      ),

      you: this.#players.findIndex(({ id }) => id === playerId),
      currentPlayer: this.#currentPlayerIndex,
      gameEndDetails: this.#gameOverDetails,
    };
  }

  move(playerId: string, stationNumber: number): GameMoveResponse {
    const isMrx = this.#isMrX(playerId);

    if (!this.#isPlayerTurn(playerId)) {
      return { status: false, message: "Not Your Move ..!" };
    }

    if (this.#isMrXCaught(stationNumber)) {
      const playerInfo = this.#players.find(({ id }) => id === playerId);

      this.#gameOverDetails = {
        isGameOver: true,
        resultInfo: {
          detective: playerInfo!.name,
          color: playerInfo!.color,
          station: stationNumber,
        },
      };
    }

    if (
      this.#isPlaceOccupied(stationNumber) && !this.#isMrXCaught(stationNumber)
    ) {
      return { status: false, message: "Station already occupied ..!" };
    }

    this.#players[this.#currentPlayerIndex].position = stationNumber;
    this.#currentPlayerIndex = (this.#currentPlayerIndex + 1) %
      this.#players.length;

    if (isMrx) this.#mrxMoves.push({ ticket: "taxi", position: stationNumber });

    return { status: true, message: `Moved to ${stationNumber}` };
  }

  getPlayers() {
    return this.#players;
  }
}
