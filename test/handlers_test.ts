import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { createApp } from "../src/app.ts";
import { PlayerSessions } from "../src/models/playerSessions.ts";
import { LobbyManager, User } from "../src/models/lobby.ts";
import { GameManager } from "../src/models/gameManager.ts";

describe("Static page", () => {
  it("Should return index page", async () => {
    const playerSessions = new PlayerSessions();
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const playerId: string = playerSessions.createSession("teja");
    lobbyManager.addPlayer({ id: playerId, name: "teja" });

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const headers = { cookie: "playerId=0" };

    const res = await app.request("http://localhost:8000", { headers });
    res.text();

    assertEquals(res.status, 200);
    assertEquals(res.headers.get("content-type"), "text/html; charset=UTF-8");
  });
});

describe("Game Join", () => {
  it("Should redirect to waiting page", async () => {
    const playerSessions = new PlayerSessions();
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const playerId: string = playerSessions.createSession("teja");
    lobbyManager.addPlayer({ id: playerId, name: "teja" });

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const fd = new FormData();
    fd.set("name", "sherlocks");
    const res = await app.request("http://localhost:8000/lobby/join", {
      method: "post",
      body: fd,
      headers: {
        cookie: `roomId=1; playerId=${playerId}`,
      },
    });
    res.text();

    assertEquals(res.status, 302);
    assertEquals(res.headers.get("content-type"), null);
    assertEquals(res.headers.get("location"), "/waiting.html");
  });

  it("Should redirect to waiting page even it is 6th player", async () => {
    const playerSessions = new PlayerSessions();
    const playerId = playerSessions.createSession("Name");

    const lobbyManager = new LobbyManager();
    lobbyManager.addPlayer({ id: "1", name: "James" });
    lobbyManager.addPlayer({ id: "2", name: "James2" });
    lobbyManager.addPlayer({ id: "3", name: "James3" });
    lobbyManager.addPlayer({ id: "4", name: "James4" });
    lobbyManager.addPlayer({ id: "5", name: "James5" });
    const gameManager = new GameManager();

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const res = await app.request("http://localhost:8000/lobby/join", {
      headers: { "cookie": ` playerId=${playerId}` },
      method: "POST",
    });
    res.text();

    assertEquals(res.status, 302);
    assertEquals(res.headers.get("content-type"), null);
    assertEquals(res.headers.get("location"), "/waiting.html");
  });
});

describe("fetch players", () => {
  it("it should return all player names and isLobbyFull as false", async () => {
    const playerSessions = new PlayerSessions();
    const playerId = playerSessions.createSession("a");
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer({ id: playerId, name: "a" }).roomId;
    const gameManager = new GameManager();

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const players = ["a"];
    const isLobbyFull = false;
    const headers = { cookie: `roomId=${roomId}; playerId=${playerId}` };
    const req = new Request("http://localhost:8000/lobby/room/status", {
      headers,
    });
    const res = await app.request(req);

    assertEquals(await res.json(), { players, isLobbyFull });
    assertEquals(res.status, 200);
  });

  it("it should return to home page if roomId not present", async () => {
    const playerSessions = new PlayerSessions();
    const playerId = playerSessions.createSession("Name");

    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const headers = { cookie: `playerId=${playerId}` };
    const req = new Request("http://localhost:8000/lobby/room/status", {
      headers,
    });
    const res = await app.request(req);

    assertEquals(res.status, 302);
    assertEquals(res.headers.get("location"), "/");
  });

  it("it should return to home page if roomId is invalid", async () => {
    const playerSessions = new PlayerSessions();
    const playerId = playerSessions.createSession("Name");

    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );
    const headers = { cookie: `roomId=123; playerId=${playerId}` };
    const req = new Request("http://localhost:8000/lobby/room/status", {
      headers,
    });
    const res = await app.request(req);

    assertEquals(res.status, 302);
    assertEquals(res.headers.get("location"), "/");
  });

  it("it should assign roles and colors", async () => {
    const playerSessions = new PlayerSessions();
    const playerId = playerSessions.createSession("Nm");

    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const players: User[] = [
      { name: "a", id: playerId },
      { name: "b", id: "2" },
      { name: "c", id: "3" },
      { name: "d", id: "4" },
      { name: "e", id: "5" },
      { name: "f", id: "6" },
    ];
    gameManager.saveGame({ gameId: "1", players });
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const expected = [
      { name: "a", id: playerId, color: "yellow", position: 1, role: "Mr.X" },
      { name: "b", id: "2", color: "green", position: 2, role: "Detective" },
      { name: "c", id: "3", color: "red", position: 3, role: "Detective" },
      { name: "d", id: "4", color: "blue", position: 4, role: "Detective" },
      { name: "e", id: "5", color: "violet", position: 5, role: "Detective" },
      { name: "f", id: "6", color: "black", position: 6, role: "Detective" },
    ];
    const headers = { cookie: `gameId=1; playerId=${playerId}` };
    const req = new Request("http://localhost:8000/game/details", { headers });
    const res = await app.request(req);
    assertEquals(await res.json(), expected);
    assertEquals(res.status, 200);
  });

  it("it should return isLobbyFull as true", async () => {
    const playerSessions = new PlayerSessions();
    const playerId = playerSessions.createSession("Name");

    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    lobbyManager.addPlayer({ id: playerId, name: "Name" });
    lobbyManager.addPlayer({ id: "2", name: "James2" });
    lobbyManager.addPlayer({ id: "3", name: "James3" });
    lobbyManager.addPlayer({ id: "4", name: "James4" });
    lobbyManager.addPlayer({ id: "5", name: "James5" });
    const roomId = lobbyManager.addPlayer({ id: "6", name: "James6" }).roomId;
    lobbyManager.createGame(roomId);

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const isLobbyFull = true;
    const headers = { cookie: `roomId=${roomId}; playerId=${playerId}` };
    const req = new Request("http://localhost:8000/lobby/room/status", {
      headers,
    });
    const res = await app.request(req);

    assertEquals(res.status, 200);
    assertEquals(await res.json(), { isLobbyFull });
  });
});

describe("logout", () => {
  it("Should redirect to the login page after deleting cookie", async () => {
    const playerSessions = new PlayerSessions();
    const playerId = playerSessions.createSession("abc");
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );
    const req = await app.request("/auth/logout", {
      headers: { cookie: `playerId=${playerId}` },
    });

    assertEquals(req.status, 302);
    assertEquals(req.headers.get("location"), "/login.html");
  });
});

describe("leave lobby", () => {
  it("should remove the player from lobby and redirect to home page", async () => {
    const playerSessions = new PlayerSessions();
    const playerId = playerSessions.createSession("abc");
    const lobbyManager = new LobbyManager();

    const roomId = lobbyManager.addPlayer({ id: playerId, name: "abc" }).roomId;
    lobbyManager.addPlayer({ id: "2", name: "anc" });
    lobbyManager.addPlayer({ id: "3", name: "anc2" });
    const gameManager = new GameManager();
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );
    const req = new Request("http://localhost:8000/lobby/room/leave", {
      method: "POST",
      headers: {
        cookie: `playerId=${playerId}; roomId=${roomId}`,
      },
    });
    const res = await app.request(req);
    const expected = "/";
    const actual = await res.text();
    assertEquals(actual, expected);
  });
});

describe("Game Page", () => {
  it("Should change position", async () => {
    const playerSessions = new PlayerSessions();
    const playerId = playerSessions.createSession("a");
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const players: User[] = [
      { name: "a", id: playerId },
      { name: "b", id: "2" },
      { name: "c", id: "3" },
      { name: "d", id: "4" },
      { name: "e", id: "5" },
      { name: "f", id: "6" },
    ];
    gameManager.saveGame({ gameId: "1", players });
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const headers = { cookie: `gameId=1;playerId=${playerId}` };
    const data = { stationNumber: 7 };

    const res = await app.request("/game/move", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    assertEquals(res.status, 200);
    assertEquals(res.headers.get("content-type"), "application/json");
    const result = await res.json();
    assertEquals(result, { message: "Moved to 7" });
  });

  it("Should say not your move", async () => {
    const playerSessions = new PlayerSessions();

    const playerId = playerSessions.createSession("a");
    const playerId2 = playerSessions.createSession("b");
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();

    const players: User[] = [
      { name: "a", id: playerId },
      { name: "b", id: playerId2 },
      { name: "c", id: "3" },
      { name: "d", id: "4" },
      { name: "e", id: "5" },
      { name: "f", id: "6" },
    ];
    gameManager.saveGame({ gameId: "1", players });
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const headers = { cookie: `gameId=1; playerId=${playerId2}` };
    const data = { stationNumber: 7 };

    const res = await app.request("/game/move", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    assertEquals(res.status, 403);
    assertEquals(res.headers.get("content-type"), "application/json");
    const result = await res.json();
    assertEquals(result, { message: "Not Your Move ..!" });
  });
});

describe("mock game status", () => {
  it("should return mock game data", async () => {
    const playerSessions = new PlayerSessions();
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();

    const app = createApp(playerSessions, lobbyManager, gameManager);

    const res = await app.request("/game/mock-status");

    const status = {
      you: 1,
      currentPlayer: 0,
      players: [
        {
          name: "Mr. X",
          color: "black",
          inventory: {
            tickets: { taxi: 4, bus: 4, underground: 3, black: 2 },
            cards: { doubleMove: 2 },
          },
        },
        {
          name: "Red",
          color: "red",
          position: 13,
          inventory: {
            tickets: { taxi: 10, bus: 8, underground: 4, black: 0 },
          },
        },
        {
          name: "Blue",
          color: "blue",
          position: 25,
          inventory: {
            tickets: { taxi: 7, bus: 6, underground: 3, black: 0 },
          },
        },
        {
          name: "Green",
          color: "green",
          position: 30,
          inventory: {
            tickets: { taxi: 6, bus: 4, underground: 2, black: 0 },
          },
        },
        {
          name: "Yellow",
          color: "yellow",
          position: 19,
          inventory: {
            tickets: { taxi: 9, bus: 7, underground: 3, black: 0 },
          },
        },
        {
          name: "Purple",
          color: "purple",
          position: 34,
          inventory: {
            tickets: { taxi: 8, bus: 6, underground: 3, black: 0 },
          },
        },
      ],
      mrXMoves: [{ ticket: "taxi" }],
      stations: {
        taxi: [12, 14],
        bus: [15],
        underground: [],
        black: [],
      },
    };

    assertEquals(res.status, 200);
    assertEquals(await res.json(), status);
  });
});
