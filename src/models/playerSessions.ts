export class PlayerSessions {
  #sessions: Map<number, string>;

  constructor() {
    this.#sessions = new Map();
  }

  add(sessionId: number, name: string) {
    return this.#sessions.set(sessionId, name);
  }

  getPlayer(sessionId: number) {
    return this.#sessions.get(sessionId);
  }

  delete(sessionId: number) {
    return this.#sessions.delete(sessionId);
  }
}
