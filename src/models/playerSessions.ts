export class PlayerSessions {
  #sessions: Map<string, string>;

  constructor() {
    this.#sessions = new Map();
  }

  add(sessionId: string, name: string) {
    return this.#sessions.set(sessionId, name);
  }

  getPlayer(sessionId: string) {
    return this.#sessions.get(sessionId);
  }

  get sessions() {
    return this.#sessions;
  }
}
