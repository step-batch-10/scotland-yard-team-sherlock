import { assertEquals, assertFalse } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { LobbyManager } from "../../src/models/lobbyManager.ts";
import { Room } from "../../src/models/room.ts";

describe("Lobby Manager", () => {
  it("should give roomId and players as null when first player is added", () => {
    const lobbyManager = new LobbyManager(() => "123");
    const { roomId, players } = lobbyManager.assignRoom({
      id: "1",
      name: "James",
    });

    assertEquals(players, undefined);
    assertEquals(roomId, "123");
  });

  it("should return players and roomId if 6 players are there", () => {
    const lobbyManager = new LobbyManager(() => "123");

    lobbyManager.assignRoom({ id: "1", name: "James1" });
    lobbyManager.assignRoom({ id: "2", name: "James2" });
    lobbyManager.assignRoom({ id: "3", name: "James3" });
    lobbyManager.assignRoom({ id: "4", name: "James4" });
    lobbyManager.assignRoom({ id: "5", name: "James5" });

    const { players, roomId } = lobbyManager.assignRoom({
      id: "6",
      name: "James6",
    });

    assertEquals(players, [
      { id: "1", name: "James1" },
      { id: "2", name: "James2" },
      { id: "3", name: "James3" },
      { id: "4", name: "James4" },
      { id: "5", name: "James5" },
      { id: "6", name: "James6" },
    ]);
    assertEquals(roomId, "123");
    assertFalse(lobbyManager.getRoom("123"));
  });

  it("should add player to existing room and return the roomId", () => {
    const lobbyManager = new LobbyManager(
      () => "123",
      new Map([["123", new Room(6, [{ name: "Name", id: "111" }])]]),
    );

    const players = lobbyManager.addToRoom("123", { name: "Name2", id: "222" });

    assertFalse(players);
    assertEquals(lobbyManager.getRoom("123")?.players, [
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

  it("should not give game id if game does not exist", () => {
    const lobbyManager = new LobbyManager(() => "111");
    const gameId = lobbyManager.getGameId("123");
    assertFalse(gameId);
  });

  it("should give gameId when 6 players joined", () => {
    const lobbyManager = new LobbyManager(
      () => "123",
      new Map([[
        "123",
        new Room(6, [
          { name: "Name1", id: "111" },
          { name: "Name2", id: "222" },
          { name: "Name3", id: "333" },
          { name: "Name4", id: "444" },
          { name: "Name5", id: "555" },
        ]),
      ]]),
    );

    lobbyManager.assignRoom({ name: "Name6", id: "666" });

    const gameId = lobbyManager.getGameId("666");

    assertEquals(gameId, "123");
  });

  it("should give players list when 6th player joined with roomId", () => {
    const lobbyManager = new LobbyManager(
      () => "123",
      new Map([[
        "123",
        new Room(6, [
          { name: "Name1", id: "111" },
          { name: "Name2", id: "222" },
          { name: "Name3", id: "333" },
          { name: "Name4", id: "444" },
          { name: "Name5", id: "555" },
        ]),
      ]]),
    );

    const players = lobbyManager.addToRoom("123", { name: "Name6", id: "666" });

    assertEquals(players, [
      { name: "Name1", id: "111" },
      { name: "Name2", id: "222" },
      { name: "Name3", id: "333" },
      { name: "Name4", id: "444" },
      { name: "Name5", id: "555" },
      { name: "Name6", id: "666" },
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
});
