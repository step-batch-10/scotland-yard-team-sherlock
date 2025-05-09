import { Game } from "./game.ts";
import { Player } from "./lobbyManager.ts";
import { Detective, Mrx } from "./gameDefinitions.ts";

export type Players = [
  Mrx,
  Detective,
  Detective,
  Detective,
  Detective,
  Detective,
];
export type Shuffler = (name: number[]) => number[];
export class GameManager {
  #games: Map<string, Game>;
  #playerToGame: Map<string, string>;
  #startingPositions: number[];

  #MrxInventory = {
    tickets: { bus: 3, taxi: 4, underground: 3, black: 5 },
    cards: { doubleMove: 2 },
  };
  #detectiveInventory = { tickets: { bus: 8, taxi: 10, underground: 4 } };

  constructor(
    shuffler: Shuffler,
    startingPositions: number[],
    games: Map<string, Game> = new Map(),
    playerToGame: Map<string, string> = new Map(),
  ) {
    this.#games = games;
    this.#playerToGame = playerToGame;
    this.#startingPositions = shuffler(startingPositions);
  }

  #gameSetup(players: Player[]): Players {
    const colors = ["#ee4444", "#2e8b57", "#1e90ff", "#9370db", "#ffa300"];
    const [mrx, ...detectives] = players;
    const mrXDetails: Mrx = {
      ...mrx,
      color: "black",
      isMrx: true,
      inventory: {
        tickets: { ...this.#MrxInventory.tickets },
        cards: { ...this.#MrxInventory.cards },
      },
      position: this.#startingPositions[0],
    };

    const detectivesDetails = detectives.map(
      ({ name, id }, index): Detective => {
        const color = colors[index];
        const inventory = { tickets: { ...this.#detectiveInventory.tickets } };

        return {
          name,
          id,
          color,
          position: this.#startingPositions[index + 1],
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
