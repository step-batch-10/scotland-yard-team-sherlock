import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { createApp } from "../src/app.ts";
import { getIdGenerator, PlayerManager } from "../src/models/playerManager.ts";
import { LobbyManager, User } from "../src/models/lobby.ts";
import { GameManager } from "../src/models/gameManager.ts";
import { GameOverDetails, GameStatus } from "../src/models/types/gameStatus.ts";
import { getPlayers } from "./models/game_test.ts";

const gameEndingDetails = (
  detective: string,
  id: number,
  color: string,
): GameOverDetails => {
  return {
    detective: detective,
    color: color,
    station: id,
  };
};

describe("Static page", () => {
  it("Should return index page", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();

    const playerId: string = playerManager.add("teja");
    lobbyManager.addPlayer({ id: playerId, name: "teja" });

    const app = createApp(playerManager, lobbyManager, gameManager);

    const headers = { cookie: `playerId=${playerId}` };

    const res = await app.request("http://localhost:8000", { headers });
    await res.text();

    assertEquals(res.status, 200);
    assertEquals(res.headers.get("content-type"), "text/html; charset=UTF-8");
  });
});

describe("Quick Join", () => {
  it("should return to waiting page if the player is logged in", async () => {
    const playerManager = new PlayerManager(
      getIdGenerator(),
      new Map([["123", "Asma"]]),
    );

    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();

    lobbyManager.addPlayer({ id: "123", name: "Asma" });

    const app = createApp(playerManager, lobbyManager, gameManager);

    const formData = new FormData();
    formData.set("name", "sherlocks");

    const res = await app.request("http://localhost:8000/lobby/quick-play", {
      method: "post",
      body: formData,
      headers: { cookie: `playerId=123` },
    });
    res.text();

    assertEquals(res.status, 302);
    assertEquals(res.headers.get("content-type"), null);
    assertEquals(res.headers.get("location"), "/waiting.html");
  });

  it("Should redirect to waiting page even it is 6th player", async () => {
    const playerManager = new PlayerManager(
      getIdGenerator(),
      new Map([
        ["111", "James1"],
        ["222", "James2"],
        ["333", "James3"],
        ["444", "James4"],
        ["555", "James5"],
        ["666", "James6"],
      ]),
    );

    const lobbyManager = new LobbyManager();
    lobbyManager.addPlayer({ id: "111", name: "Janes1" });
    lobbyManager.addPlayer({ id: "222", name: "Janes2" });
    lobbyManager.addPlayer({ id: "333", name: "Janes3" });
    lobbyManager.addPlayer({ id: "444", name: "Janes4" });
    lobbyManager.addPlayer({ id: "555", name: "Janes5" });
    const gameManager = new GameManager();

    const app = createApp(playerManager, lobbyManager, gameManager);

    const res = await app.request("http://localhost:8000/lobby/quick-play", {
      headers: { "cookie": ` playerId=666` },
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
    const playerManager = new PlayerManager(
      getIdGenerator(),
      new Map([["111", "James"]]),
    );
    const lobbyManager = new LobbyManager();
    const roomId = lobbyManager.addPlayer({ id: "111", name: "James" }).roomId;
    const gameManager = new GameManager();

    const app = createApp(playerManager, lobbyManager, gameManager);

    const players = ["James"];
    const isLobbyFull = false;
    const headers = { cookie: `roomId=${roomId}; playerId=111` };
    const req = new Request("http://localhost:8000/lobby/room/status", {
      headers,
    });
    const res = await app.request(req);

    assertEquals(await res.json(), { players, isLobbyFull });
    assertEquals(res.status, 200);
  });

  it("it should return to home page if roomId not present", async () => {
    const playerManager = new PlayerManager(
      getIdGenerator(),
      new Map([["111", "James"]]),
    );

    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();

    const app = createApp(playerManager, lobbyManager, gameManager);

    const req = new Request("http://localhost:8000/lobby/room/status", {
      headers: { cookie: `playerId=111` },
    });
    const res = await app.request(req);

    assertEquals(res.status, 302);
    assertEquals(res.headers.get("location"), "/");
  });

  it("should give players with colors", async () => {
    const playerManager = new PlayerManager(getIdGenerator(["123"]));
    const playerId = playerManager.add("name");

    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const players: User[] = [
      { name: "a", id: "1" },
      { name: "b", id: "2" },
      { name: "c", id: "3" },
      { name: "d", id: "4" },
      { name: "e", id: "5" },
      { name: "f", id: "6" },
    ];

    gameManager.saveGame({ gameId: "1", players });
    const app = createApp(playerManager, lobbyManager, gameManager);

    const expected = getPlayers();
    const headers = { cookie: `gameId=1; playerId=${playerId}` };
    const req = new Request("http://localhost:8000/game/details", { headers });
    const res = await app.request(req);

    assertEquals(await res.json(), expected);
    assertEquals(res.status, 200);
  });

  it("it should return isLobbyFull as true", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const playerId = playerManager.add("Name");

    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    lobbyManager.addPlayer({ id: playerId, name: "Name" });
    lobbyManager.addPlayer({ id: "2", name: "James2" });
    lobbyManager.addPlayer({ id: "3", name: "James3" });
    lobbyManager.addPlayer({ id: "4", name: "James4" });
    lobbyManager.addPlayer({ id: "5", name: "James5" });

    const roomId = lobbyManager.addPlayer({ id: "6", name: "James6" }).roomId;
    lobbyManager.createGame(roomId);
    const app = createApp(playerManager, lobbyManager, gameManager);

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
    const playerManager = new PlayerManager(getIdGenerator());
    const playerId = playerManager.add("abc");
    const lobbyManager = new LobbyManager();
    const gameManager = new GameManager();
    const app = createApp(playerManager, lobbyManager, gameManager);
    const req = await app.request("/auth/logout", {
      headers: { cookie: `playerId=${playerId}` },
    });

    assertEquals(req.status, 302);
    assertEquals(req.headers.get("location"), "/login.html");
  });
});

describe("leave lobby", () => {
  it("should remove the player from lobby and redirect to home page", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const playerId = playerManager.add("abc");
    const lobbyManager = new LobbyManager();

    const roomId = lobbyManager.addPlayer({ id: playerId, name: "abc" }).roomId;
    lobbyManager.addPlayer({ id: "2", name: "anc" });
    lobbyManager.addPlayer({ id: "3", name: "anc2" });
    const gameManager = new GameManager();
    const app = createApp(playerManager, lobbyManager, gameManager);
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
    const playerManager = new PlayerManager(getIdGenerator());
    const playerId = playerManager.add("a");
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
    const app = createApp(playerManager, lobbyManager, gameManager);

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
    const playerManager = new PlayerManager(getIdGenerator(["111", "222"]));

    const playerId = playerManager.add("a");
    const playerId2 = playerManager.add("b");

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
    const app = createApp(playerManager, lobbyManager, gameManager);

    const data = { stationNumber: 7 };

    const res = await app.request("/game/move", {
      method: "POST",
      headers: { cookie: `gameId=1; playerId=${playerId2}` },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    assertEquals(res.status, 403);
    assertEquals(res.headers.get("content-type"), "application/json");
    assertEquals(result, { message: "Not Your Move ..!" });
  });

  describe("serveGameStatus", () => {
    it("should return game initial status for mrx", async () => {
      const playerManager = new PlayerManager(getIdGenerator());
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();

      const mrxId = playerManager.add("MrX");

      const { roomId } = lobbyManager.addPlayer({ name: "mrxId", id: mrxId });
      lobbyManager.addPlayer({ name: "d1", id: `1` });
      lobbyManager.addPlayer({ name: "d2", id: `2` });
      lobbyManager.addPlayer({ name: "d3", id: `3` });
      lobbyManager.addPlayer({ name: "d4", id: `4` });
      lobbyManager.addPlayer({ name: "d5", id: `5` });

      const { gameId, players } = lobbyManager.createGame(roomId);
      gameManager.saveGame({ gameId, players });

      const request = new Request("http://localhost:8000/game/status", {
        headers: { "cookie": `playerId=${mrxId}; gameId=${gameId}` },
      });

      const app = createApp(playerManager, lobbyManager, gameManager);
      const response = await app.request(request);

      const gameStatus: GameStatus = {
        players: [
          {
            name: "mrxId",
            id: mrxId,
            color: "black",
            isMrx: true,
            inventory: {
              tickets: { bus: 3, taxi: 4, underground: 3, black: 5 },
              cards: { doubleMove: 2 },
            },
            position: 1,
          },
          {
            name: "d1",
            id: "1",
            color: "#63a4ff",
            position: 2,
            isMrx: false,
            inventory: { tickets: { bus: 8, taxi: 10, underground: 4 } },
          },
          {
            name: "d2",
            id: "2",
            color: "#ffb347",
            position: 3,
            isMrx: false,
            inventory: { tickets: { bus: 8, taxi: 10, underground: 4 } },
          },
          {
            name: "d3",
            id: "3",
            color: "red",
            position: 4,
            isMrx: false,
            inventory: { tickets: { bus: 8, taxi: 10, underground: 4 } },
          },
          {
            name: "d4",
            id: "4",
            color: "blue",
            position: 5,
            isMrx: false,
            inventory: { tickets: { bus: 8, taxi: 10, underground: 4 } },
          },
          {
            name: "d5",
            id: "5",
            color: "violet",
            position: 6,
            isMrx: false,
            inventory: { tickets: { bus: 8, taxi: 10, underground: 4 } },
          },
        ],
        mrXMoves: [],
        you: 0,
        currentPlayer: 0,
      };

      const responseBody = await response.json();

      assertEquals(response.status, 200);
      assertEquals(responseBody, gameStatus);
    });

    it("should give init game status for detective", async () => {
      const playerManager = new PlayerManager(getIdGenerator());
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();

      const detId = playerManager.add("Det");

      lobbyManager.addPlayer({ name: "mrxId", id: "1" });
      lobbyManager.addPlayer({ name: "d1", id: detId });
      lobbyManager.addPlayer({ name: "d2", id: `2` });
      lobbyManager.addPlayer({ name: "d3", id: `3` });
      lobbyManager.addPlayer({ name: "d4", id: `4` });
      const { roomId } = lobbyManager.addPlayer({ name: "d5", id: `5` });

      const { gameId, players } = lobbyManager.createGame(roomId);
      gameManager.saveGame({ gameId, players });

      const request = new Request("http://localhost:8000/game/status", {
        headers: { "cookie": `playerId=${detId}; gameId=${gameId}` },
      });

      const app = createApp(playerManager, lobbyManager, gameManager);
      const response = await app.request(request);

      const gameStatus: GameStatus = {
        currentPlayer: 0,
        mrXMoves: [],
        players: [
          {
            color: "black",
            id: "1",
            inventory: {
              cards: {
                doubleMove: 2,
              },
              tickets: {
                black: 5,
                bus: 3,
                taxi: 4,
                underground: 3,
              },
            },
            isMrx: true,
            name: "mrxId",
          },
          {
            color: "#63a4ff",
            id: detId,
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d1",
            position: 2,
          },
          {
            color: "#ffb347",
            id: "2",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d2",
            position: 3,
          },
          {
            color: "red",
            id: "3",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d3",
            position: 4,
          },
          {
            color: "blue",
            id: "4",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d4",
            position: 5,
          },
          {
            color: "violet",
            id: "5",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d5",
            position: 6,
          },
        ],
        you: 1,
      };

      assertEquals(response.status, 200);
      assertEquals(await response.json(), gameStatus);
    });

    it("should give game status for detective on reveal turn", async () => {
      const playerManager = new PlayerManager(getIdGenerator());
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();

      const detId = playerManager.add("Det");

      lobbyManager.addPlayer({ name: "mrxId", id: "1" });
      lobbyManager.addPlayer({ name: "d1", id: detId });
      lobbyManager.addPlayer({ name: "d2", id: `2` });
      lobbyManager.addPlayer({ name: "d3", id: `3` });
      lobbyManager.addPlayer({ name: "d4", id: `4` });

      const { roomId } = lobbyManager.addPlayer({ name: "d5", id: `5` });

      const { gameId, players } = lobbyManager.createGame(roomId);
      gameManager.saveGame({ gameId, players });

      const request = new Request("http://localhost:8000/game/status", {
        headers: { "cookie": `playerId=${detId}; gameId=${gameId}` },
      });

      const app = createApp(playerManager, lobbyManager, gameManager);

      const game = gameManager.getGame(gameId)!;

      game.move("1", 30);
      game.move(detId, 29);
      game.move("2", 28);
      game.move("3", 27);
      game.move("4", 26);
      game.move("5", 25);

      game.move("1", 24);
      game.move(detId, 23);
      game.move("2", 22);
      game.move("3", 21);
      game.move("4", 20);
      game.move("5", 19);

      game.move("1", 18);

      const response = await app.request(request);

      const gameStatus: GameStatus = {
        currentPlayer: 1,
        mrXMoves: [
          { ticket: "taxi" },
          { ticket: "taxi" },
          { ticket: "taxi", position: 18 },
        ],
        players: [
          {
            color: "black",
            id: "1",
            inventory: {
              cards: {
                doubleMove: 2,
              },
              tickets: {
                black: 5,
                bus: 3,
                taxi: 4,
                underground: 3,
              },
            },
            position: 18,
            isMrx: true,
            name: "mrxId",
          },
          {
            color: "#63a4ff",
            id: detId,
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d1",
            position: 23,
          },
          {
            color: "#ffb347",
            id: "2",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d2",
            position: 22,
          },
          {
            color: "red",
            id: "3",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d3",
            position: 21,
          },
          {
            color: "blue",
            id: "4",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d4",
            position: 20,
          },
          {
            color: "violet",
            id: "5",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d5",
            position: 19,
          },
        ],
        you: 1,
      };

      assertEquals(response.status, 200);
      assertEquals(await response.json(), gameStatus);
    });

    it("should return gagameEndDetails undeifned when Detecatives are unable catch mr.X", async () => {
      const playerManager = new PlayerManager(getIdGenerator());
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();

      const detId = playerManager.add("Det");

      lobbyManager.addPlayer({ name: "mrxId", id: "1" });
      lobbyManager.addPlayer({ name: "d1", id: detId });
      lobbyManager.addPlayer({ name: "d2", id: `2` });
      lobbyManager.addPlayer({ name: "d3", id: `3` });
      lobbyManager.addPlayer({ name: "d4", id: `4` });

      const { roomId } = lobbyManager.addPlayer({ name: "d5", id: `5` });

      const { gameId, players } = lobbyManager.createGame(roomId);
      gameManager.saveGame({ gameId, players });

      const request = new Request("http://localhost:8000/game/status", {
        headers: { "cookie": `playerId=${detId}; gameId=${gameId}` },
      });

      const app = createApp(playerManager, lobbyManager, gameManager);

      const game = gameManager.getGame(gameId)!;

      game.move("1", 30);
      game.move(detId, 29);
      game.move("2", 28);
      game.move("3", 27);
      game.move("4", 26);
      game.move("5", 30);

      game.move("1", 24);
      game.move(detId, 23);
      game.move("2", 22);
      game.move("3", 21);
      game.move("4", 20);
      game.move("5", 19);

      game.move("1", 18);

      const response = await app.request(request);

      const gameStatus: GameStatus = {
        currentPlayer: 1,
        gameEndDetails: gameEndingDetails("d5", 30, "violet"),
        mrXMoves: [
          { ticket: "taxi" },
          { ticket: "taxi" },
          { ticket: "taxi", position: 18 },
        ],
        players: [
          {
            color: "black",
            id: "1",
            inventory: {
              cards: {
                doubleMove: 2,
              },
              tickets: {
                black: 5,
                bus: 3,
                taxi: 4,
                underground: 3,
              },
            },
            position: 18,
            isMrx: true,
            name: "mrxId",
          },
          {
            color: "#63a4ff",
            id: detId,
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d1",
            position: 23,
          },
          {
            color: "#ffb347",
            id: "2",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d2",
            position: 22,
          },
          {
            color: "red",
            id: "3",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d3",
            position: 21,
          },
          {
            color: "blue",
            id: "4",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d4",
            position: 20,
          },
          {
            color: "violet",
            id: "5",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d5",
            position: 19,
          },
        ],
        you: 1,
      };
      assertEquals(response.status, 200);
      assertEquals(await response.json(), gameStatus);
    });

    it("should return game status ", async () => {
      const playerManager = new PlayerManager(getIdGenerator());
      const lobbyManager = new LobbyManager();
      const gameManager = new GameManager();

      const detId = playerManager.add("Det");

      lobbyManager.addPlayer({ name: "mrxId", id: "1" });
      lobbyManager.addPlayer({ name: "d1", id: detId });
      lobbyManager.addPlayer({ name: "d2", id: `2` });
      lobbyManager.addPlayer({ name: "d3", id: `3` });
      lobbyManager.addPlayer({ name: "d4", id: `4` });

      const { roomId } = lobbyManager.addPlayer({ name: "d5", id: `5` });

      const { gameId, players } = lobbyManager.createGame(roomId);
      gameManager.saveGame({ gameId, players });

      const request = new Request("http://localhost:8000/game/status", {
        headers: { "cookie": `playerId=${detId}; gameId=${gameId}` },
      });

      const app = createApp(playerManager, lobbyManager, gameManager);

      const game = gameManager.getGame(gameId)!;

      game.move("1", 30);
      game.move(detId, 29);
      game.move("2", 28);
      game.move("3", 27);
      game.move("4", 26);
      game.move("5", 25);

      game.move("1", 24);
      game.move(detId, 23);
      game.move("2", 22);
      game.move("3", 21);
      game.move("4", 20);
      game.move("5", 19);

      game.move("1", 18);

      const response = await app.request(request);

      const gameStatus: GameStatus = {
        currentPlayer: 1,

        mrXMoves: [
          { ticket: "taxi" },
          { ticket: "taxi" },
          { ticket: "taxi", position: 18 },
        ],
        players: [
          {
            color: "black",
            id: "1",
            inventory: {
              cards: {
                doubleMove: 2,
              },
              tickets: {
                black: 5,
                bus: 3,
                taxi: 4,
                underground: 3,
              },
            },
            position: 18,
            isMrx: true,
            name: "mrxId",
          },
          {
            color: "#63a4ff",
            id: detId,
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d1",
            position: 23,
          },
          {
            color: "#ffb347",
            id: "2",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d2",
            position: 22,
          },
          {
            color: "red",
            id: "3",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d3",
            position: 21,
          },
          {
            color: "blue",
            id: "4",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d4",
            position: 20,
          },
          {
            color: "violet",
            id: "5",
            inventory: {
              tickets: {
                bus: 8,
                taxi: 10,
                underground: 4,
              },
            },
            isMrx: false,
            name: "d5",
            position: 19,
          },
        ],
        you: 1,
      };
      assertEquals(response.status, 200);
      assertEquals(await response.json(), gameStatus);
    });
  });
});

describe("Join user", () => {
  it("should add the player to exiting room when valid room is given", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const playerId1 = playerManager.add("john");
    const playerId2 = playerManager.add("james");
    const lobbyManager = new LobbyManager();
    const roomId =
      lobbyManager.addPlayer({ id: playerId1, name: "john" }).roomId;
    const gameManager = new GameManager();
    const app = createApp(playerManager, lobbyManager, gameManager);

    const fd = new FormData();
    fd.set("room-id", roomId);
    const response = await app.request("/lobby/room/join", {
      method: "POST",
      body: fd,
      headers: { cookie: `playerId=${playerId2}` },
    });

    assertEquals(response.status, 302);
    assertEquals(await response.json(), { location: "/waiting.html" });
  });

  it("should add the player to exiting room when valid room is given and create game if room is full", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const playerId1 = playerManager.add("john");
    const playerId2 = playerManager.add("james");
    const lobbyManager = new LobbyManager();
    const roomId =
      lobbyManager.addPlayer({ id: playerId1, name: "john" }).roomId;
    lobbyManager.addPlayer({ name: "mrxId", id: "1" });
    lobbyManager.addPlayer({ name: "d1", id: "5" });
    lobbyManager.addPlayer({ name: "d2", id: "2" });
    lobbyManager.addPlayer({ name: "d3", id: "3" });

    const gameManager = new GameManager();
    const app = createApp(playerManager, lobbyManager, gameManager);

    const fd = new FormData();
    fd.set("room-id", roomId);
    const response = await app.request("/lobby/room/join", {
      method: "POST",
      body: fd,
      headers: { cookie: `playerId=${playerId2}` },
    });

    assertEquals(response.status, 302);
    assertEquals(await response.json(), { location: "/waiting.html" });
  });
});
