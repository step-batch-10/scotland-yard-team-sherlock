import { assertEquals, assertFalse } from "assert";

import { describe, test } from "jsr:@std/testing/bdd";
import { LobbyManager } from "../src/models/lobby.ts";

describe("Lobby Manager", () => {
  test("Should add player and return roomId", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer("1");
    const players = lobbyManager.getRoomPlayers(roomId);
    assertEquals(players.length, 1);
  });

  test("should empty the lobby ", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer("1");
    const remainingPlayers = lobbyManager.removePlayer(roomId, "1");

    assertEquals(remainingPlayers.length, 0);
  });

  test("Should return true by game deletion", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer("1");

    assertFalse(lobbyManager.isRoomFull(roomId));
  });

  test("Should return game players in lobby", () => {
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer("1");
    assertEquals(lobbyManager.getRoomPlayers(roomId), ["1"]);
  });

  test("Should return game players in lobby", () => {
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
});
