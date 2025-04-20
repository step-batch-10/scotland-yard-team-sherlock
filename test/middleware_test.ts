import { assertEquals } from "assert";
import { describe, test } from "testing/bdd";
import { PlayerSessions } from "../src/models/playerSessions.ts";
import { LobbyManager } from "../src/models/lobby.ts";
import { GameManager } from "../src/models/gameManager.ts";
import { createApp } from "../src/app.ts";

describe("validations", () => {
  test("Should return to waiting page. If gameId cookie is not available.", async () => {
    const playerSessions = new PlayerSessions();
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const response = await app.request("/game/status");

    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/");
  });

  test("Should return to waiting page if roomId available.", async () => {
    const playerSessions = new PlayerSessions();
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const roomId: string = lobbyManager.addPlayer("1");

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const response = await app.request("/game/join", {
      method: "POST",
      headers: { cookie: `roomId=${roomId}` },
    });
    assertEquals(response.status, 302);
  });
});
