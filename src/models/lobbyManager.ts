import { Room } from "./room.ts";

export interface Player {
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

  deleteRoom(roomId: string): boolean {
    return this.#rooms.delete(roomId);
  }

  addToRoom(roomId: string, player: Player): { roomId: string; room: Room } {
    const room = this.#rooms.get(roomId)!;
    room.add(player);

    return { room, roomId };
  }

  #roomOf(playerId: string): { room: Room; roomId: string } | undefined {
    for (const [roomId, room] of this.#rooms) {
      if (room.has(playerId)) {
        return { roomId, room };
      }
    }
  }

  #createRoom(player: Player): { room: Room; roomId: string } {
    const roomId = this.#generateId();
    const room = new Room(2);

    this.#rooms.set(roomId, room);

    room.add(player);
    return { room, roomId };
  }

  #joinableRoom(player: Player): { room: Room; roomId: string } {
    for (const [roomId, room] of this.#rooms) {
      if (!room.isPrivate) {
        room.add(player);
        return { roomId, room };
      }
    }

    return this.#createRoom(player);
  }

  assignRoom(player: Player): { room: Room; roomId: string } {
    return this.#roomOf(player.id) || this.#joinableRoom(player);
  }

  getRoom(roomId: string) {
    return this.#rooms.get(roomId);
  }

  hostRoom(player: Player): { room: Room; roomId: string } {
    const room = new Room(3, true);
    room.add(player);
    const roomId = this.#generateId();
    this.#rooms.set(roomId, room);
    return { room, roomId };
  }
}
