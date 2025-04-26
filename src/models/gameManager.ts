import { Game } from "./game.ts";
import { Player } from "./lobbyManager.ts";
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
  #playerToGame: Map<string, string>;

  #MrxInventory = {
    tickets: { bus: 3, taxi: 4, underground: 3, black: 5 },
    cards: { doubleMove: 2 },
  };
  #detectiveInventory = { tickets: { bus: 8, taxi: 10, underground: 4 } };

  constructor(
    games: Map<string, Game> = new Map(),
    playerToGame: Map<string, string> = new Map(),
  ) {
    this.#games = games;
    this.#playerToGame = playerToGame;
  }

  #gameSetup(players: Player[]): Players {
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
        const inventory = { tickets: { ...this.#detectiveInventory.tickets } };

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

  getGameId(playerId: string) {
    return this.#playerToGame.get(playerId);
  }

  #addPlayerToGame(gameId: string, players: Player[]) {
    players.forEach(({ id }) => this.#playerToGame.set(id, gameId));
  }

  createGame(gameId: string, players: Player[]): string {
    this.#addPlayerToGame(gameId, players);
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

  removePlayerGameId(playerId: string) {
    return this.#playerToGame.delete(playerId);
  }
}
