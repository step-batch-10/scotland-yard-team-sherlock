export class PlayerSessions {
  #sessions: Map<number, string>;
  #id: number;

  constructor() {
    this.#sessions = new Map();
    this.#id = 0;
  }

  #add(sessionId: number, name: string) {
    return this.#sessions.set(sessionId, name);
  }

  createSession(name: string) {
    this.#add(this.#id, name);
    return "" + this.#id++;
  }

  getPlayer(sessionId: number) {
    return this.#sessions.get(sessionId);
  }

  get sessions() {
    return this.#sessions;
  }
}
