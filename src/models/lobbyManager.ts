import { Room } from "./room.ts";

export interface NewPlayer {
  id: string;
  name: string;
}

export class LobbyManager {
  #rooms: Map<string, Room>;
  #generateId;

  constructor(generateId: () => string, rooms: Map<string, Room> = new Map()) {
    this.#generateId = generateId;
    this.#rooms = rooms;
  }

  addToRoom(roomId: string, player: NewPlayer): { roomId: string; room: Room } {
    const room = this.#rooms.get(roomId)!;
    room.addPlayer(player);

    return { room, roomId };
  }

  #roomOf(playerId: string): { room: Room; roomId: string } | undefined {
    for (const [roomId, room] of this.#rooms) {
      if (room.hasPlayer(playerId)) {
        return { roomId, room };
      }
    }
  }

  #createRoom(player: NewPlayer): { room: Room; roomId: string } {
    const roomId = this.#generateId();
    const room = new Room(6);

    this.#rooms.set(roomId, room);

    room.addPlayer(player);
    return { room, roomId };
  }

  #joinableRoom(player: NewPlayer): { room: Room; roomId: string } {
    for (const [roomId, room] of this.#rooms) {
      if (!room.isPrivate) {
        room.addPlayer(player);
        return { roomId, room };
      }
    }

    return this.#createRoom(player);
  }

  assignRoom(player: NewPlayer): { room: Room; roomId: string } {
    return this.#roomOf(player.id) || this.#joinableRoom(player);
  }

  getRoom(roomId: string) {
    return this.#rooms.get(roomId);
  }
}
