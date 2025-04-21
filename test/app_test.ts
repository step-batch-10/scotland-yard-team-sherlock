import { assert, assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { PlayerSessions } from "../src/models/playerSessions.ts";
import { createApp } from "../src/app.ts";
import { LobbyManager } from "../src/models/lobby.ts";
import { GameManager } from "../src/models/gameManager.ts";
import { Player } from "../src/handlers.ts";

describe("Authentication", () => {
  describe("validatePlayerSession", () => {
    it("should redirect to login page if no playerId provided", async () => {
      const app = createAppWithPlayers("player1");

      const response = await app.request("/");

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/login.html");
    });

    it("should redirect to login page if playerId doesn't exists in sessions", async () => {
      const app = createAppWithPlayers("player1");

      const response = await app.request("/", {
        headers: { cookie: "playerId=123456789" },
      });

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/login.html");
    });

    it("should give home page if valid playerId exists", async () => {
      const app = createAppWithPlayers("PlayerName1");

      const response = await app.request("/", {
        headers: { cookie: "playerId=0" },
      });

      assertEquals(response.status, 200);
    });
  });

  describe("login", () => {
    it("should add new player to playerSessions and redirect to home", async () => {
      const playerSessions = new PlayerSessions();
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();

      const app = createApp(
        playerSessions,
        lobbyManager,
        gameManager,
      );

      const formData = new FormData();
      formData.set("player-name", "PlayerName1");

      const request = new Request("http://localhost:8000/login", {
        body: formData,
        method: "POST",
      });

      const response = await app.request(request);

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/");
      assertEquals(playerSessions.sessions.size, 1);
      assert(response.headers.has("set-cookie"));
    });
  });

  describe("checkUserLogin", () => {
    it("should redirect to root if user already logged in", async () => {
      const app = createAppWithPlayers("player1");
      const request = new Request("http://localhost:8000/login.html", {
        headers: { cookie: "playerId=0" },
      });

      const response = await app.request(request);

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/");
    });

    it("should serve login page if user is not logged in", async () => {
      const app = createAppWithPlayers("");
      const request = new Request("http://localhost:8000/login.html");
      const response = await app.request(request);
      await response.text();

      assertEquals(response.status, 200);
    });
  });

  describe("serveGameStatus", () => {
    it("should serve init data for all players positions with colors", async () => {
      const playerSessions = new PlayerSessions();
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();

      const players: Player[] = [
        { name: "a", id: "1", color: "red", position: 1 },
        { name: "b", id: "2", color: "blue", position: 2 },
        { name: "c", id: "3", color: "green", position: 3 },
      ];

      gameManager.createGame("1", players);

      const app = createApp(
        playerSessions,
        lobbyManager,
        gameManager,
      );

      const response = await app.request("/game/status", {
        headers: { cookie: "gameId=1" },
      });

      const playerPositions = [
        { color: "red", isCurrentPlayer: true, name: "a", position: 1 },
        { color: "blue", isCurrentPlayer: false, name: "b", position: 2 },
        { color: "green", name: "c", isCurrentPlayer: false, position: 3 },
      ];

      const expected = { isYourTurn: true, playerPositions };
      assertEquals(response.status, 200);
      assertEquals(await response.json(), expected);
    });
  });
});

export const createAppWithPlayers = (
  loggedInUser: string,
) => {
  const playerSessions = new PlayerSessions();
  playerSessions.createSession(loggedInUser);
  const lobbyManager = new LobbyManager();
  const gameManager = new GameManager();

  const app = createApp(
    playerSessions,
    lobbyManager,
    gameManager,
  );
  return app;
};
