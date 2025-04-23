export class PlayerManager {
  #sessions: Map<string, string>;
  #id: number;

  constructor() {
    this.#sessions = new Map();
    this.#id = 0;
  }

  #add(sessionId: string, name: string) {
    return this.#sessions.set(sessionId, name);
  }

  createSession(name: string) {
    const id = this.#id.toString();
    this.#add(id, name);
    this.#id++;
    return id;
  }

  getPlayer(sessionId: string) {
    return this.#sessions.get(sessionId);
  }

  delete(sessionId: string) {
    return this.#sessions.delete(sessionId);
  }

  get sessions() {
    return this.#sessions;
  }
}
