import { Room, RoomStatus } from "./room.ts";

export interface NewPlayer {
  id: string;
  name: string;
}

export class LobbyManager {
  #rooms: Map<string, Room>;
  #playerToGame: Map<string, string>;
  #generateId;

  constructor(
    generateId: () => string,
    rooms: Map<string, Room> = new Map(),
    playerToGame: Map<string, string> = new Map(),
  ) {
    this.#generateId = generateId;
    this.#rooms = rooms;
    this.#playerToGame = playerToGame;
  }

  addToRoom(roomId: string, player: NewPlayer): NewPlayer[] | undefined {
    const room = this.#rooms.get(roomId)!;
    const players = room.addPlayer(player);

    if (players) {
      this.#addPlayerToGame(roomId, players);
      this.#rooms.delete(roomId);
    }

    return players;
  }

  getGameId(playerId: string) {
    return this.#playerToGame.get(playerId);
  }

  #roomOf(playerId: string): { roomId: string } | undefined {
    for (const [roomId, room] of this.#rooms) {
      if (room.hasPlayer(playerId)) {
        return { roomId };
      }
    }
  }

  #joinableRoom(player: NewPlayer): RoomStatus {
    for (const [roomId, room] of this.#rooms) {
      if (!room.isPrivate) {
        const players = room.addPlayer(player);
        return { roomId, players };
      }
    }

    const roomId = this.#generateId();
    const room = new Room(6);

    this.#rooms.set(roomId, room);

    const players = room.addPlayer(player);
    return { players, roomId };
  }

  #roomFor(player: NewPlayer): RoomStatus {
    const alreadyExistingRoom = this.#roomOf(player.id);
    return alreadyExistingRoom || this.#joinableRoom(player);
  }

  #addPlayerToGame(roomId: string, players: NewPlayer[]) {
    players.forEach(({ id }) => this.#playerToGame.set(id, roomId));
  }

  assignRoom(player: NewPlayer): { players?: NewPlayer[]; roomId: string } {
    const { players, roomId } = this.#roomFor(player);

    if (players) {
      this.#addPlayerToGame(roomId, players);
      this.#rooms.delete(roomId);
    }

    return { roomId, players };
  }

  getRoom(roomId: string) {
    return this.#rooms.get(roomId);
  }
}
