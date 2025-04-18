export class Lobby {
  #players: Map<string, string>;

  constructor() {
    this.#players = new Map();
  }

  addPlayer(sessionId: string, name: string) {
    this.#players.set(sessionId, name);
  }

  removePlayer(sessionId: string) {
    this.#players.delete(sessionId);
  }

  isLobbyFull(): boolean {
    return this.#players.size === 6;
  }

  get players() {
    const playerNames = [];
    for (const [_, name] of this.#players) {
      playerNames.push(name);
    }
    return playerNames;
  }
}
