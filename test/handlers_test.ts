import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { createApp } from "../src/app.ts";
import { PlayerSessions } from "../src/models/playerSessions.ts";
import { LobbyManager } from "../src/models/lobby.ts";
import { GameManager } from "../src/models/gameManager.ts";
import { Player } from "../src/models/game.ts";

describe("Static page", () => {
  it("Should return index page", async () => {
    const playerSessions = new PlayerSessions();
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const roomId: string = playerSessions.createSession("teja");
    lobbyManager.addPlayer(roomId);

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const headers = { cookie: "playerSessionId=0" };

    const res = await app.request("http://localhost:8000", { headers });
    res.text();

    assertEquals(res.status, 200);
    assertEquals(res.headers.get("content-type"), "text/html; charset=UTF-8");
  });
});

describe("Game Join", () => {
  //   it("Should redirect to waiting page", async () => {
  //     const app = createAppWithPlayers("Asma", []);

  //     const fd = new FormData();
  //     fd.set("name", "sherlocks");
  //     const res = await app.request("http://localhost:8000/game/join", {
  //       method: "post",
  //       body: fd,
  //       headers: {
  //         cookie: "roomId=1",
  //       },
  //     });
  //     res.text();

  //     assertEquals(res.status, 302);
  //     assertEquals(res.headers.get("content-type"), null);
  //     assertEquals(res.headers.get("location"), "/waiting.html");
  //   });

  //   it("Should redirect to waiting page even it is 6th player", async () => {
  //     const playerSessions = new PlayerSessions();
  //     const lobbyManager = new LobbyManager();
  //     lobbyManager.addPlayer("1");
  //     lobbyManager.addPlayer("2");
  //     lobbyManager.addPlayer("3");
  //     lobbyManager.addPlayer("4");
  //     lobbyManager.addPlayer("5");
  //     const gameManager = new GameManager();

  //     const app = createApp(
  //       playerSessions,
  //       lobbyManager,
  //       gameManager,
  //     );

  //     const fd = new FormData();
  //     fd.set("name", "sherlocks");
  //     const res = await app.request("http://localhost:8000/game/join", {
  //       method: "post",
  //       body: fd,
  //     });
  //     res.text();

  //     assertEquals(res.status, 302);
  //     assertEquals(res.headers.get("content-type"), null);
  //     assertEquals(res.headers.get("location"), "/waiting.html");
  //   });
});

describe("fetch players", () => {
  it("it should return allPlayer names and isLobbyFull as false", async () => {
    const playerSessions = new PlayerSessions();
    const playerSessionId = playerSessions.createSession("a");
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer(playerSessionId);
    const gameManager = new GameManager();

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const players = ["a"];
    const isLobbyFull = false;
    const headers = { cookie: `roomId=${roomId}` };
    const req = new Request("http://localhost:8000/fetch-players", { headers });
    const res = await app.fetch(req);
    assertEquals(await res.json(), { players, isLobbyFull });
    assertEquals(res.status, 200);
  });

  it("it should return isLobbyFull as true", async () => {
    const playerSessions = new PlayerSessions();
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    lobbyManager.addPlayer("1");
    lobbyManager.addPlayer("2");
    lobbyManager.addPlayer("3");
    lobbyManager.addPlayer("4");
    lobbyManager.addPlayer("5");
    const roomId = lobbyManager.addPlayer("6");
    lobbyManager.movePlayersToGame(roomId);

    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const isLobbyFull = true;
    const headers = { cookie: `roomId=${roomId};playerSessionId=6` };
    const req = new Request("http://localhost:8000/fetch-players", { headers });
    const res = await app.fetch(req);
    assertEquals(await res.json(), { isLobbyFull });
    assertEquals(res.status, 200);
  });

  it("it should assign roles and colors", async () => {
    const playerSessions = new PlayerSessions();
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const players: Player[] = [
      { name: "a", id: "1", color: "red", position: 1 },
      { name: "b", id: "2", color: "red", position: 1 },
      { name: "c", id: "3", color: "red", position: 1 },
      { name: "d", id: "4", color: "red", position: 1 },
      { name: "e", id: "5", color: "red", position: 1 },
      { name: "f", id: "6", color: "red", position: 1 },
    ];
    gameManager.createGame("1", players);
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );
    const playersWithRoles = players.map((pl) => {
      return { ...pl, role: "Detective" };
    });

    const headers = { cookie: `gameId=1` };
    const req = new Request("http://localhost:8000/assign-roles", { headers });
    const res = await app.request(req);
    assertEquals(await res.json(), playersWithRoles);
    assertEquals(res.status, 200);
  });
});

describe("logout", () => {
  it("Should redirect to the login page after deleting cookie", async () => {
    const playerSessions = new PlayerSessions();
    const sessionId = playerSessions.createSession("abc");
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );
    const req = await app.request("/logout", {
      headers: { cookie: `playerSessionId=${sessionId}` },
    });

    assertEquals(req.status, 302);
    assertEquals(req.headers.get("location"), "/login.html");
  });
});

describe("leave lobby", () => {
  it("should remove the player from lobby and redirect to home page", async () => {
    const playerSessions = new PlayerSessions();
    const sessionId = playerSessions.createSession("abc");
    const lobbyManager = new LobbyManager();

    const roomId = lobbyManager.addPlayer(sessionId);
    lobbyManager.addPlayer("2");
    lobbyManager.addPlayer("3");
    const gameManager = new GameManager();
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );
    const req = new Request("http://localhost:8000/leave-lobby", {
      method: "POST",
      headers: {
        cookie: `playerSessionId=${sessionId}; roomId=${roomId}`,
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
    const sessionId = playerSessions.createSession("a");
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const players: Player[] = [
      { name: "a", id: sessionId, color: "red", position: 1 },
      { name: "b", id: "2", color: "red", position: 1 },
      { name: "c", id: "3", color: "red", position: 2 },
      { name: "d", id: "4", color: "red", position: 3 },
      { name: "e", id: "5", color: "red", position: 4 },
      { name: "f", id: "6", color: "red", position: 5 },
    ];
    gameManager.createGame("1", players);
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const headers = { cookie: `gameId=1;playerSessionId=${sessionId}` };
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
    const sessionId = playerSessions.createSession("a");
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const players: Player[] = [
      { name: "a", id: sessionId, color: "red", position: 1 },
      { name: "b", id: "2", color: "red", position: 1 },
      { name: "c", id: "3", color: "red", position: 2 },
      { name: "d", id: "4", color: "red", position: 3 },
      { name: "e", id: "5", color: "red", position: 4 },
      { name: "f", id: "6", color: "red", position: 5 },
    ];
    gameManager.createGame("1", players);
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
    );

    const headers = { cookie: `gameId=1;playerSessionId=2` };
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
