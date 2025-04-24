import { Player } from "./lobbyManager.ts";

export class Room {
  isPrivate: boolean = false;
  #players: Player[];
  #capacity: number;

  constructor(capacity: number, players: Player[] = []) {
    this.#players = players;
    this.#capacity = capacity;
  }

  get players() {
    return this.#players;
  }

  has(playerId: string): boolean {
    return this.#players.some(({ id }) => id === playerId);
  }

  get isFull() {
    return this.#players.length >= this.#capacity;
  }

  add(player: Player) {
    return this.#players.push(player);
  }

  remove(playerId: string) {
    this.#players = this.#players.filter(({ id }) => id !== playerId);
  }
}
