import { Players } from "./gameManager.ts";

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
  #currentPlayerIndex: number = 0;

  constructor(players: Players) {
    this.#players = players;
  }

  #isPlayerTurn(playerId: string) {
    return this.#players[this.#currentPlayerIndex].id === playerId;
  }

  #isPlaceOccupied(stationNumber: number) {
    return this.#players.some(({ position }) => stationNumber === position);
  }

  gameStatus(playerId: string) {
    return {
      isYourTurn: this.#players[this.#currentPlayerIndex].id === playerId,
      playerPositions: this.#players.map((
        { color, position, id, name, inventory },
      ) => ({
        isCurrentPlayer: this.#players[this.#currentPlayerIndex].id === id,
        color,
        position,
        name,
        inventory,
      })),
    };
  }

  move(playerId: string, stationNumber: number): GameMoveResponse {
    if (!this.#isPlayerTurn(playerId)) {
      return { status: false, message: "Not Your Move ..!" };
    }

    if (this.#isPlaceOccupied(stationNumber)) {
      return { status: false, message: "Station already occupied ..!" };
    }

    this.#players[this.#currentPlayerIndex].position = stationNumber;
    this.#currentPlayerIndex = (this.#currentPlayerIndex + 1) %
      this.#players.length;

    return { status: true, message: `Moved to ${stationNumber}` };
  }

  getPlayers() {
    return this.#players;
  }
}
