import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { LobbyManager, Room } from "../../src/models/lobby.ts";

describe("Lobby Manager", () => {
  it("Should add player and return roomId", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer({ id: "1", name: "James" }).roomId;
    const players = lobbyManager.getRoomPlayers(roomId);
    assertEquals(players.length, 1);
  });

  it("should empty the lobby ", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer({ id: "1", name: "James" }).roomId;
    const remainingPlayers = lobbyManager.removePlayer(roomId, "1");

    assertEquals(remainingPlayers.length, 0);
  });

  it("Should return true by game deletion", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer({ id: "1", name: "James" }).roomId;

    assertFalse(lobbyManager.isRoomFull(roomId));
  });

  it("Should return game players in lobby", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer({ id: "1", name: "James" }).roomId;
    assertEquals(lobbyManager.getRoomPlayers(roomId), [{
      id: "1",
      name: "James",
    }]);
  });

  it("Should return game players in lobby and get gameId", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer({ id: "1", name: "James" }).roomId;
    assertEquals(lobbyManager.getGameId("1"), null);

    lobbyManager.addPlayer({ id: "2", name: "James2" });
    lobbyManager.addPlayer({ id: "3", name: "James3" });
    lobbyManager.addPlayer({ id: "4", name: "James4" });
    lobbyManager.addPlayer({ id: "5", name: "James5" });
    lobbyManager.addPlayer({ id: "6", name: "James6" });
    const { gameId } = lobbyManager.createGame(roomId);
    assertEquals(lobbyManager.getGameId("1"), gameId);
  });

  it("should give game instance with one player", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer({ id: "1", name: "James" }).roomId;

    assert(lobbyManager.getRoom(roomId) instanceof Room);
    assertEquals(
      lobbyManager.getRoom(roomId)!.players,
      [{ id: "1", name: "James" }],
    );
  });

  it("should return undefined if room doesn't exist", () => {
    const lobbyManager = new LobbyManager();

    assertEquals(lobbyManager.getRoom("123"), undefined);
  });
});
