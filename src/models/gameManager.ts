import { Game } from "./game.ts";
import { User } from "./lobby.ts";
import { Detective, MrX } from "./types/setupModel.ts";

export type Players = [
  MrX,
  Detective,
  Detective,
  Detective,
  Detective,
  Detective,
];

export class GameManager {
  #games: Map<string, Game>;
  #MrxInventory = {
    tickets: { bus: 3, taxi: 4, underground: 3, black: 5 },
    cards: { doubleMove: 2 },
  };
  #detectiveInventory = { tickets: { bus: 8, taxi: 10, underground: 4 } };

  constructor() {
    this.#games = new Map();
  }

  #gameSetup(players: User[]): Players {
    const colors = ["#63a4ff", "#ffb347", "red", "blue", "violet"];
    const [mrx, ...detectives] = players;
    const mrXDetails: MrX = {
      ...mrx,
      color: "black",
      isMrx: true,
      inventory: this.#MrxInventory,
      position: 1,
    };

    const detectivesDetails = detectives.map(
      ({ name, id }, index): Detective => {
        const color = colors[index];
        const inventory = this.#detectiveInventory;

        return {
          name,
          id,
          color,
          position: index + 2,
          isMrx: false,
          inventory,
        };
      },
    );

    return [mrXDetails, ...detectivesDetails] as Players;
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
