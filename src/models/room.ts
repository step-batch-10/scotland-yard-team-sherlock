import { NewPlayer } from "./lobbyManager.ts";

export interface RoomStatus {
  roomId: string;
  players?: NewPlayer[];
}

export class Room {
  isPrivate: boolean = false;
  #players: NewPlayer[];
  #capacity: number;

  constructor(capacity: number, players: NewPlayer[] = []) {
    this.#players = players;
    this.#capacity = capacity;
  }

  get players() {
    return this.#players;
  }

  hasPlayer(playerId: string): boolean {
    return this.#players.some(({ id }) => id === playerId);
  }

  addPlayer(player: NewPlayer): NewPlayer[] | undefined {
    this.#players.push(player);
    return this.#players.length >= this.#capacity ? this.#players : undefined;
  }

  leave(playerId: string) {
    this.#players = this.#players.filter(({ id }) => id !== playerId);
  }
}
