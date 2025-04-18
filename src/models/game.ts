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
  #players: Player[];
  #currentPlayerIndex: number = 0;

  constructor(players: Player[]) {
    this.#players = players;
  }

  #isPlayerTurn(playerGameId: string) {
    return this.#players[this.#currentPlayerIndex].id === playerGameId;
  }

  #isPlaceOccupied(stationNumber: number) {
    return this.#players.some(({ position }) => stationNumber === position);
  }

  gameStatus(playerGameId: string) {
    return {
      isYourTurn: this.#players[this.#currentPlayerIndex].id === playerGameId,
      playerPositions: this.#players.map(({ color, position, id, name }) => ({
        isCurrentPlayer: this.#players[this.#currentPlayerIndex].id === id,
        color,
        position,
        name,
      })),
    };
  }

  move(playerGameId: string, stationNumber: number): GameMoveResponse {
    if (!this.#isPlayerTurn(playerGameId)) {
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
}
