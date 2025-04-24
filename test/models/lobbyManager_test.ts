import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { LobbyManager } from "../../src/models/lobbyManager.ts";
import { Room } from "../../src/models/room.ts";

describe("Lobby Manager", () => {
  it("should give roomId and room which is not full if only one player is there", () => {
    const lobbyManager = new LobbyManager(() => "123");
    const { roomId, room } = lobbyManager.assignRoom({
      id: "1",
      name: "James",
    });

    assertFalse(room.isFull);
    assertEquals(roomId, "123");
  });

  it("should give roomId and room which is full if 6 players are added", () => {
    const lobbyManager = new LobbyManager(
      () => "123",
      new Map([
        [
          "123",
          new Room(6, [
            { id: "1", name: "James1" },
            { id: "2", name: "James2" },
            { id: "3", name: "James3" },
            { id: "4", name: "James4" },
            { id: "5", name: "James5" },
          ]),
        ],
      ]),
    );

    const { room, roomId } = lobbyManager.assignRoom({
      id: "6",
      name: "James6",
    });

    assert(room.isFull);
    assertEquals(roomId, "123");
  });

  it("should add player to existing room and return the roomId", () => {
    const lobbyManager = new LobbyManager(
      () => "123",
      new Map([["123", new Room(6, [{ name: "Name", id: "111" }])]]),
    );

    const { room, roomId } = lobbyManager.addToRoom("123", {
      name: "Name2",
      id: "222",
    });

    assertFalse(room.isFull);
    assertEquals(roomId, "123");
    assertEquals(room.players, [
      {
        id: "111",
        name: "Name",
      },
      {
        id: "222",
        name: "Name2",
      },
    ]);
  });

  it("should not join any other room if already in one room", () => {
    const lobbyManager = new LobbyManager(
      () => "123",
      new Map([[
        "123",
        new Room(6, [{ name: "Name1", id: "111" }]),
      ]]),
    );

    lobbyManager.assignRoom({ name: "Name1", id: "111" });

    assertEquals(lobbyManager.getRoom("123")?.players, [{
      name: "Name1",
      id: "111",
    }]);
  });

  it("should delete existing room", () => {
    const lobbyManager = new LobbyManager(
      () => "123",
      new Map([[
        "123",
        new Room(6, [{ name: "Name1", id: "111" }]),
      ]]),
    );

    lobbyManager.deleteRoom("123");

    assertFalse(lobbyManager.getRoom("123"));
  });
});
