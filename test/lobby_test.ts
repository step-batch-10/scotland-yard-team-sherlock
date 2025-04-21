import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { LobbyManager, Room } from "../src/models/lobby.ts";

describe("Lobby Manager", () => {
  it("Should add player and return roomId", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer("1");
    const players = lobbyManager.getRoomPlayers(roomId);
    assertEquals(players.length, 1);
  });

  it("should empty the lobby ", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer("1");
    const remainingPlayers = lobbyManager.removePlayer(roomId, "1");

    assertEquals(remainingPlayers.length, 0);
  });

  it("Should return true by game deletion", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer("1");

    assertFalse(lobbyManager.isRoomFull(roomId));
  });

  it("Should return game players in lobby", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer("1");
    assertEquals(lobbyManager.getRoomPlayers(roomId), ["1"]);
  });

  it("Should return game players in lobby and get gameId", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer("1");
    assertEquals(lobbyManager.getGameId("1"), null);

    lobbyManager.addPlayer("2");
    lobbyManager.addPlayer("3");
    lobbyManager.addPlayer("4");
    lobbyManager.addPlayer("5");
    lobbyManager.addPlayer("6");
    const gameId = lobbyManager.movePlayersToGame(roomId);
    assertEquals(lobbyManager.getGameId("1"), gameId);
  });

  it("should give game instance with one player", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer("1");

    assert(lobbyManager.getRoom(roomId) instanceof Room);
    assertEquals(lobbyManager.getRoom(roomId)!.players, ["1"]);
  });

  it("should return undefined if room doesn't exist", () => {
    const lobbyManager = new LobbyManager();

    assertEquals(lobbyManager.getRoom("123"), undefined);
  });
});
