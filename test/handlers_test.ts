import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { createApp } from "../src/app.ts";
import { PlayerSessions } from "../src/models/playerSessions.ts";
import { LobbyManager } from "../src/models/lobby.ts";
import { GameManager } from "../src/models/gameManager.ts";
import { Game, Player } from "../src/models/game.ts";

describe("Static page", () => {
  it("Should return index page", async () => {
    const playerSessions = new PlayerSessions();
    playerSessions.createSession("detective1");

    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const game = new Game([]);
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
      game,
    );

    const headers = { cookie: "playerSessionId=0" };

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
    const game = new Game([]);
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
      game,
    );

    const fd = new FormData();
    fd.set("name", "sherlocks");
    const res = await app.request("http://localhost:8000/game/join", {
      method: "post",
      body: fd,
    });
    res.text();

    assertEquals(res.status, 302);
    assertEquals(res.headers.get("content-type"), null);
    assertEquals(res.headers.get("location"), "/waiting.html");
  });

  it("Should redirect to waiting page even it is 6th player", async () => {
    const playerSessions = new PlayerSessions();
    const lobbyManager = new LobbyManager();
    lobbyManager.addPlayer("1");
    lobbyManager.addPlayer("2");
    lobbyManager.addPlayer("3");
    lobbyManager.addPlayer("4");
    lobbyManager.addPlayer("5");
    const gameManager = new GameManager();
    const game = new Game([]);
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
      game,
    );

    const fd = new FormData();
    fd.set("name", "sherlocks");
    const res = await app.request("http://localhost:8000/game/join", {
      method: "post",
      body: fd,
    });
    res.text();

    assertEquals(res.status, 302);
    assertEquals(res.headers.get("content-type"), null);
    assertEquals(res.headers.get("location"), "/waiting.html");
  });
});

describe("fetch players", () => {
  it("it should return allPlayer names and isLobbyFull as false", async () => {
    const playerSessions = new PlayerSessions();
    const playerSessionId = playerSessions.createSession("a");
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer(playerSessionId);
    const gameManager = new GameManager();
    const game = new Game([]);
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
      game,
    );

    const players = ["a"];
    const isLobbyFull = false;
    const headers = { cookie: `roomId=${roomId}` };
    const req = new Request("http://localhost:8000/fetch-players", { headers });
    const res = await app.fetch(req);
    assertEquals(await res.json(), { players, isLobbyFull });
    assertEquals(res.status, 200);
  });

  // it("it should return allPlayer names and isLobbyFull as true", async () => {
  //   const playerSessions = new PlayerSessions();
  //   const lobbyManager = new LobbyManager();
  //   playerSessions.createSession("a");
  //   playerSessions.createSession("b");
  //   playerSessions.createSession("c");
  //   playerSessions.createSession("d");
  //   playerSessions.createSession("e");
  //   playerSessions.createSession("f");
  //   lobbyManager.addPlayer("0");
  //   const roomId = lobbyManager.addPlayer("1");
  //   lobbyManager.addPlayer("2");
  //   lobbyManager.addPlayer("3");
  //   lobbyManager.addPlayer("4");
  //   lobbyManager.addPlayer("5");
  //   console.log("   -----------", roomId);

  //   console.log(lobbyManager.getRoomPlayers(roomId));
  //   const gameId = lobbyManager.movePlayersToGame(roomId);
  //   const gameManager = new GameManager();
  //   const game = new Game([]);
  //   const app = createApp(
  //     playerSessions,
  //     lobbyManager,
  //     gameManager,
  //     game,
  //   );
  //   const players = ["a", "b", "c", "d", "e", "f"];
  //   const isLobbyFull = true;
  //   const headers = { cookie: `roomId=${roomId}` };
  //   const req = new Request("http://localhost:8000/fetch-players", { headers });
  //   const res = await app.fetch(req);

  //   assertEquals(await res.json(), { players, isLobbyFull });
  //   assertEquals(res.status, 200);
  // });

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
    const game = new Game([]);
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
      game,
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

    const playerId = playerSessions.createSession("player1");

    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const game = new Game([]);
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
      game,
    );

    const headers = { cookie: `playerSessionId=${playerId}` };

    const res = await app.request("/logout", { headers });

    assertEquals(res.status, 302);
    assertEquals(res.headers.get("location"), "/login.html");
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
    const game = new Game([]);
    const app = createApp(
      playerSessions,
      lobbyManager,
      gameManager,
      game,
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
