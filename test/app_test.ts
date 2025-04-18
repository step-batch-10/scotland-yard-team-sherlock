import { assert, assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { PlayerSessions } from "../src/models/playerSessions.ts";
import { createApp } from "../src/app.ts";
import { Lobby, LobbyManager } from "../src/models/lobby.ts";
import { GameManager } from "../src/models/gameManager.ts";
import { Game, Player } from "../src/models/game.ts";

describe("Authentication", () => {
  describe("validatePlayerSession", () => {
    it("should redirect to login page if no playerSessionId provided", async () => {
      const playerSessions = new PlayerSessions();
      const lobby = new Lobby();
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();
      const game = new Game([]);
      const app = createApp(
        playerSessions,
        lobby,
        lobbyManager,
        gameManager,
        game,
      );

      const response = await app.request("/");

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/login.html");
    });

    it("should redirect to login page if playerSessionId doesn't exists in sessions", async () => {
      const playerSessions = new PlayerSessions();
      const lobby = new Lobby();
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();
      const game = new Game([]);
      const app = createApp(
        playerSessions,
        lobby,
        lobbyManager,
        gameManager,
        game,
      );

      const response = await app.request("/", {
        headers: { cookie: "playerSessionId=123456789" },
      });

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/login.html");
    });

    it("should give home page if valid playerSessionId exists", async () => {
      const playerSessions = new PlayerSessions();
      playerSessions.createSession("PlayerName1");

      const lobby = new Lobby();
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();
      const game = new Game([]);
      const app = createApp(
        playerSessions,
        lobby,
        lobbyManager,
        gameManager,
        game,
      );

      const response = await app.request("/", {
        headers: { cookie: "playerSessionId=0" },
      });

      assertEquals(response.status, 200);
    });
  });

  describe("login", () => {
    it("should add new player to playerSessions and redirect to home", async () => {
      const playerSessions = new PlayerSessions();
      const lobby = new Lobby();
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();
      const game = new Game([]);
      const app = createApp(
        playerSessions,
        lobby,
        lobbyManager,
        gameManager,
        game,
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
      const playerSessions = new PlayerSessions();
      playerSessions.createSession("PlayerName1");

      const lobby = new Lobby();
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();
      const game = new Game([]);
      const app = createApp(
        playerSessions,
        lobby,
        lobbyManager,
        gameManager,
        game,
      );

      const request = new Request("http://localhost:8000/login.html", {
        headers: {
          cookie: "playerSessionId=0",
        },
      });

      const response = await app.request(request);

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/");
    });

    it("should serve login page if user is not logged in", async () => {
      const playerSessions = new PlayerSessions();

      const lobby = new Lobby();
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();
      const game = new Game([]);
      const app = createApp(
        playerSessions,
        lobby,
        lobbyManager,
        gameManager,
        game,
      );

      const request = new Request("http://localhost:8000/login.html");
      const response = await app.request(request);
      await response.text();

      assertEquals(response.status, 200);
    });
  });

  describe("serveGamePage", () => {
    it("should set game id cookie and serve game page", async () => {
      const playerSessions = new PlayerSessions();
      const lobby = new Lobby();
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();
      const game = new Game([]);
      const app = createApp(
        playerSessions,
        lobby,
        lobbyManager,
        gameManager,
        game,
      );

      const request = new Request("http://localhost:8000/game.html");

      const response = await app.request(request);

      await response.text();

      assertEquals(response.status, 200);
      assert(response.headers.has("set-cookie"));
    });
  });

  describe("serveGameStatus", () => {
    it("should serve init data for all players positions with colors", async () => {
      const players = [
        { id: "0", color: "red", position: 1, name: "Asma" },
        { id: "1", color: "blue", position: 2, name: "Deepanshu" },
        { id: "2", color: "green", position: 3, name: "Sanika" },
      ];
      const app = createAppWithPlayers(players);

      const response = await app.request("/game/status", {
        headers: { cookie: "playerGameId=0" },
      });

      assertEquals(response.status, 200);
      assertEquals(await response.json(), {
        isYourTurn: true,
        playerPositions: [
          {
            color: "red",
            isCurrentPlayer: true,
            name: "Asma",
            position: 1,
          },
          {
            color: "blue",
            name: "Deepanshu",
            isCurrentPlayer: false,
            position: 2,
          },
          {
            color: "green",
            name: "Sanika",
            isCurrentPlayer: false,
            position: 3,
          },
        ],
      });
    });

    it("should return data with isYourTurn false", async () => {
      const players = [
        { id: "0", color: "red", position: 1, name: "Asma" },
        { id: "1", color: "blue", position: 2, name: "Deepanshu" },
        { id: "2", color: "green", position: 3, name: "Sanika" },
      ];
      const app = createAppWithPlayers(players);

      const request = new Request("http://localhost:8000/game/status", {
        headers: {
          cookie: "playerGameId=1",
        },
      });

      const response = await app.request(request);

      assertEquals(response.status, 200);
      assertEquals(await response.json(), {
        isYourTurn: false,
        playerPositions: [
          {
            color: "red",
            isCurrentPlayer: true,
            name: "Asma",
            position: 1,
          },
          {
            color: "blue",
            name: "Deepanshu",
            isCurrentPlayer: false,
            position: 2,
          },
          {
            color: "green",
            name: "Sanika",
            isCurrentPlayer: false,
            position: 3,
          },
        ],
      });
    });

    it("should give data with second player as current player after one move", async () => {
      const playerSessions = new PlayerSessions();
      const lobby = new Lobby();
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();

      const players = [
        { id: "0", color: "red", position: 1, name: "Asma" },
        { id: "1", color: "blue", position: 2, name: "Deepanshu" },
        { id: "2", color: "green", position: 3, name: "Sanika" },
      ];
      const game = new Game(players);
      game.move("0", 12);

      const app = createApp(
        playerSessions,
        lobby,
        lobbyManager,
        gameManager,
        game,
      );

      const request = new Request("http://localhost:8000/game/status", {
        headers: {
          cookie: "playerGameId=0",
        },
      });

      const response = await app.request(request);

      assertEquals(response.status, 200);
      assertEquals(await response.json(), {
        isYourTurn: false,
        playerPositions: [
          {
            color: "red",
            isCurrentPlayer: false,
            name: "Asma",
            position: 12,
          },
          {
            color: "blue",
            name: "Deepanshu",
            isCurrentPlayer: true,
            position: 2,
          },
          {
            color: "green",
            name: "Sanika",
            isCurrentPlayer: false,
            position: 3,
          },
        ],
      });
    });
  });

  describe("serveGameStatus", () => {
    it("should redirect to home if no playerGameId exists", async () => {
      const players = [
        { id: "0", color: "red", position: 1, name: "Asma" },
        { id: "1", color: "blue", position: 2, name: "Deepanshu" },
        { id: "2", color: "green", position: 3, name: "Sanika" },
      ];
      const app = createAppWithPlayers(players);

      const request = new Request("http://localhost:8000/game/status");

      const response = await app.request(request);

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/");
    });

    it("should make a move and return success status if player turn is valid", async () => {
      const players = [
        { id: "0", color: "red", position: 1, name: "Asma" },
        { id: "1", color: "blue", position: 2, name: "Deepanshu" },
        { id: "2", color: "green", position: 3, name: "Sanika" },
      ];
      const app = createAppWithPlayers(players);

      const request = new Request("http://localhost:8000/game/move", {
        method: "POST",
        body: JSON.stringify({ stationNumber: 12 }),
        headers: {
          cookie: "playerGameId=0",
        },
      });

      const response = await app.request(request);

      assertEquals(response.status, 200);
      assertEquals(await response.json(), { message: "Moved to 12" });
    });

    it("should return error message if its not players turn", async () => {
      const players = [
        { id: "0", color: "red", position: 1, name: "Asma" },
        { id: "1", color: "blue", position: 2, name: "Deepanshu" },
        { id: "2", color: "green", position: 3, name: "Sanika" },
      ];
      const app = createAppWithPlayers(players);

      const request = new Request("http://localhost:8000/game/move", {
        method: "POST",
        body: JSON.stringify({ stationNumber: 12 }),
        headers: {
          cookie: "playerGameId=1",
        },
      });

      const response = await app.request(request);

      assertEquals(response.status, 403);
      assertEquals(await response.json(), { message: "Not Your Move ..!" });
    });

    it("should return error if station is already occupied and turn is valid", async () => {
      const players = [
        { id: "0", color: "red", position: 1, name: "Asma" },
        { id: "1", color: "blue", position: 2, name: "Deepanshu" },
        { id: "2", color: "green", position: 3, name: "Sanika" },
      ];
      const app = createAppWithPlayers(players);
      const request = new Request("http://localhost:8000/game/move", {
        method: "POST",
        body: JSON.stringify({ stationNumber: 1 }),
        headers: {
          cookie: "playerGameId=0",
        },
      });

      const response = await app.request(request);

      assertEquals(response.status, 403);
      assertEquals(await response.json(), {
        message: "Station already occupied ..!",
      });
    });

    it("should return move error on occupied station click if move is invalid", async () => {
      const players = [
        { id: "0", color: "red", position: 1, name: "Asma" },
        { id: "1", color: "blue", position: 2, name: "Deepanshu" },
        { id: "2", color: "green", position: 3, name: "Sanika" },
      ];
      const app = createAppWithPlayers(players);

      const request = new Request("http://localhost:8000/game/move", {
        method: "POST",
        body: JSON.stringify({ stationNumber: 1 }),
        headers: {
          cookie: "playerGameId=1",
        },
      });

      const response = await app.request(request);

      assertEquals(response.status, 403);
      assertEquals(await response.json(), {
        message: "Not Your Move ..!",
      });
    });
  });
});

function createAppWithPlayers(players: Player[] = []) {
  const playerSessions = new PlayerSessions();
  const lobby = new Lobby();
  const lobbyManager = new LobbyManager();
  const gameManager = new GameManager();

  const game = new Game(players);

  const app = createApp(
    playerSessions,
    lobby,
    lobbyManager,
    gameManager,
    game,
  );
  return app;
}
