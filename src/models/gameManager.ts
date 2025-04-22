import { Game, Player } from "./game.ts";
import { User } from "./lobby.ts";

export class GameManager {
  #games: Map<string, Game>;

  constructor() {
    this.#games = new Map();
  }

  #gameSetup(players: User[]): Player[] {
    const colors = ["yellow", "green", "red", "blue", "violet", "black"];

    return players.map((player, index) => {
      const color = colors[index];
      const role = index === 0 ? "Mr.X" : "Detective";
      return { ...player, color, position: index + 1, role };
    });
  }

  saveGame({ gameId, players }: { gameId: string; players: User[] }): string {
    const game = new Game(this.#gameSetup(players));
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
