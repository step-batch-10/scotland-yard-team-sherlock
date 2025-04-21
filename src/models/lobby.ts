const generateId = (): string => Date.now().toString();

export class Room {
  #players: string[];
  #capacity: number;

  constructor(capacity: number) {
    this.#players = [];
    this.#capacity = capacity;
  }

  add(playerId: string) {
    this.#players.push(playerId);
  }

  remove(playerId: string): string[] {
    return this.#players = this.#players.filter((player) =>
      player !== playerId
    );
  }

  isFull(): boolean {
    return this.#players.length >= this.#capacity;
  }

  get players() {
    return this.#players;
  }
}

export class LobbyManager {
  #rooms: Map<string, Room>;
  #playerToGame: Map<string, string>;

  constructor() {
    this.#rooms = new Map();
    this.#playerToGame = new Map();
  }

  addPlayer(playerId: string): string {
    for (const [roomId, room] of this.#rooms) {
      if (!room.isFull()) {
        room.add(playerId);
        return roomId;
      }
    }

    const newRoom = new Room(6);
    newRoom.add(playerId);

    const roomId = generateId();
    this.#rooms.set(roomId, newRoom);
    return roomId;
  }

  removePlayer(roomId: string, playerId: string): string[] {
    return this.#rooms.get(roomId)!.remove(playerId);
  }

  #removeRoom(roomId: string): boolean {
    return this.#rooms.delete(roomId);
  }

  movePlayersToGame(roomId: string): string {
    const players = this.getRoomPlayers(roomId);
    const gameId = generateId();

    players.forEach((player) => this.#playerToGame.set(player, gameId));
    this.#removeRoom(roomId);

    return gameId;
  }

  isRoomFull(roomNo: string): boolean {
    return this.#rooms.get(roomNo)!.isFull();
  }

  getGameId(playerId: string): string | null {
    return this.#playerToGame.get(playerId) || null;
  }

  getRoomPlayers(roomNo: string): string[] {
    return this.#rooms.get(roomNo)!.players;
  }

  getRoom(roomId: string) {
    return this.#rooms.get(roomId);
  }
}
