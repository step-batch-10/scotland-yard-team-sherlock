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

  hasPlayer(playerId: string): boolean {
    return this.players.some((player) => player.id === playerId);
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

  addPlayer(player: User): { roomId: string; isLobbyFull: boolean } {
    for (const [roomId, room] of this.#rooms) {
      if (room.hasPlayer(player.id)) {
        return { roomId, isLobbyFull: room.isFull() };
      }
    }

    for (const [roomId, room] of this.#rooms) {
      if (!room.isFull()) {
        room.add(player);
        return { roomId, isLobbyFull: room.isFull() };
      }
    }

    const newRoom = new Room(6);
    newRoom.add(player);

    const roomId = generateId();
    this.#rooms.set(roomId, newRoom);
    return { roomId, isLobbyFull: newRoom.isFull() };
  }

  removePlayer(roomId: string, playerId: string): User[] {
    return this.#rooms.get(roomId)!.remove(playerId);
  }

  #removeRoom(roomId: string): boolean {
    return this.#rooms.delete(roomId);
  }

  createGame(roomId: string): { gameId: string; players: User[] } {
    const players = this.getRoomPlayers(roomId);
    players.forEach((player) => this.#playerToGame.set(player.id, roomId));
    this.#removeRoom(roomId);

    return { gameId: roomId, players };
  }

  isRoomFull(roomNo: string): boolean {
    return this.#rooms.get(roomNo)!.isFull();
  }

  getGameId(playerId: string): string | null {
    return this.#playerToGame.get(playerId) || null;
  }

  getRoomPlayers(roomId: string): User[] {
    return this.#rooms.get(roomId)!.players;
  }

  getRoom(roomId: string) {
    return this.#rooms.get(roomId);
  }

  hasRoom(roomId: string): boolean {
    return this.#rooms.has(roomId);
  }
}
