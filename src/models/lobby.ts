export class Lobby {
  #lobby: string[];
  constructor() {
    this.#lobby = [];
  }

  add(name: string) {
    return this.#lobby.push(name);
  }

  get players() {
    return this.#lobby;
  }

  isLobbyFull() {
    return this.#lobby.length === 6;
  }
}
