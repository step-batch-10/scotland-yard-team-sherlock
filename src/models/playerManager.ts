export const getIdGenerator = (values: string[] = []) => {
  let index = 0;

  return (): string => {
    return values[index++] || Date.now().toString();
  };
};
export class PlayerManager {
  #players: Map<string, string>;
  #generateId: () => string;

  constructor(
    generateId: () => string,
    players: Map<string, string> = new Map(),
  ) {
    this.#players = players;
    this.#generateId = generateId;
  }

  add(playerName: string) {
    const playerId = this.#generateId();
    this.#players.set(playerId, playerName);
    return playerId;
  }

  get(playerId: string) {
    return this.#players.get(playerId);
  }

  delete(playerId: string) {
    return this.#players.delete(playerId);
  }

  get players() {
    return this.#players;
  }
}
