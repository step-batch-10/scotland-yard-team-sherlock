import { Game, Player } from "./game.ts";

export class GameManager {
  #games: Map<string, Game>;

  constructor() {
    this.#games = new Map();
  }

  createGame(gameId: string, players: Player[]) {
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

  getGameDetails(gameId: string) {
    return this.#games.get(gameId)!.getPlayers();
  }
}
