import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { PlayerSessions } from "../src/models/playerSessions.ts";
import { LobbyManager } from "../src/models/lobby.ts";
import { GameManager } from "../src/models/gameManager.ts";
import { createApp } from "../src/app.ts";

describe("validations", () => {
  it("Should return to login page. If gameId and playerId cookie is not available.", async () => {
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
    assertEquals(response.headers.get("location"), "/login.html");
  });

  it("Should return to waiting page. If gameId cookie is not available.", async () => {
    const playerSessions = new PlayerSessions();
    const playerId = playerSessions.createSession("NAME");
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer(playerId);
    const gameManager = new GameManager();

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const headers = { cookie: ` playerId=${playerId}; roomId=${roomId}` };
    const response = await app.request("/game/status", { headers });

    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/waiting.html");
  });

  it("Should return to waiting page if roomId available.", async () => {
    const playerSessions = new PlayerSessions();
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const roomId: string = lobbyManager.addPlayer({ id: "1", name: "James" });

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const response = await app.request("/lobby/join", {
      method: "POST",
      headers: { cookie: `roomId=${roomId}` },
    });
    assertEquals(response.status, 302);
  });

  it("should redirect to waiting page if invalid gameId present", async () => {
    const playerSessions = new PlayerSessions();
    const playerId = playerSessions.createSession("Name");

    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();

    lobbyManager.addPlayer("1");
    lobbyManager.addPlayer("2");
    lobbyManager.addPlayer("3");
    lobbyManager.addPlayer("4");
    lobbyManager.addPlayer("5");
    lobbyManager.addPlayer("6");

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const response = await app.request("/game/status", {
      headers: { cookie: `gameId=123; playerId=${playerId}` },
    });
    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/waiting.html");
  });

  it("should redirect to waiting page room already exists", async () => {
    const playerSessions = new PlayerSessions();
    const playerId = playerSessions.createSession("Name");

    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer(playerId);

    const gameManager = new GameManager();

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const response = await app.request("/lobby/join", {
      method: "POST",
      headers: { cookie: `roomId=${roomId}; playerId=${playerId}` },
    });
    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/waiting.html");
  });
});
