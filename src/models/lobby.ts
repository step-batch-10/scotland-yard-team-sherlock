const generateId = (): string => Date.now().toString();

export type User = {
  id: string;
  name: string;
};

export class Room {
  #players: User[];
  #capacity: number;

  constructor(capacity: number) {
    this.#players = [];
    this.#capacity = capacity;
  }

  add(user: User) {
    this.#players.push(user);
  }

  remove(playerId: string): User[] {
    return this.#players = this.#players.filter((player) =>
      player.id !== playerId
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

  addPlayer(player: { id: string; name: string }): string {
    for (const [roomId, room] of this.#rooms) {
      if (!room.isFull()) {
        room.add(player);
        return roomId;
      }
    }

    const newRoom = new Room(6);
    newRoom.add(player);

    const roomId = generateId();
    this.#rooms.set(roomId, newRoom);
    return roomId;
  }

  removePlayer(roomId: string, playerId: string): User[] {
    return this.#rooms.get(roomId)!.remove(playerId);
  }

  #removeRoom(roomId: string): boolean {
    return this.#rooms.delete(roomId);
  }

  movePlayersToGame(roomId: string): string {
    const players = this.getRoomPlayers(roomId);
    const gameId = generateId();

    players.forEach((player) => this.#playerToGame.set(player.id, gameId));
    this.#removeRoom(roomId);

    return gameId;
  }

  isRoomFull(roomNo: string): boolean {
    return this.#rooms.get(roomNo)!.isFull();
  }

  getGameId(playerId: string): string | null {
    return this.#playerToGame.get(playerId) || null;
  }

  getRoomPlayers(roomNo: string): User[] {
    return this.#rooms.get(roomNo)!.players;
  }

  getRoom(roomId: string) {
    return this.#rooms.get(roomId);
  }
}
