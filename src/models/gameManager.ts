class Game {
  private players: string[];
  constructor(players: string[]) {
    this.players = players;
  }

  getPlayers() {
    return this.players;
  }
}

export class GameManager {
  #games: Map<string, Game>;

  constructor() {
    this.#games = new Map();
  }

  createGame(gameId: string, players: string[]) {
    const game = new Game(players);
    this.#games.set(gameId, game);
    return gameId;
  }

  getGame(gameId: string): Game | undefined {
    return this.#games.get(gameId);
  }

  hasGame(gameId: string): boolean {
    return this.#games.has(gameId);
  }

  deleteGame(gameId: string): boolean {
    return this.#games.delete(gameId);
  }
}
