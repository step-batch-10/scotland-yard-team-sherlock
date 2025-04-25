import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { stub } from "testing/mock";
import { createApp } from "../src/app.ts";
import { getIdGenerator, PlayerManager } from "../src/models/playerManager.ts";
import { LobbyManager } from "../src/models/lobbyManager.ts";
import { GameManager, Players } from "../src/models/gameManager.ts";
import { GameStatus } from "../src/models/types/gameStatus.ts";
import { Game } from "../src/models/game.ts";

const getGamePlayers = (): Players => {
  const inventory = {
    mrx: {
      tickets: { bus: 3, taxi: 4, underground: 3, black: 5 },
      cards: { doubleMove: 2 },
    },
    detective: { tickets: { bus: 8, taxi: 10, underground: 4 } },
  };

  return [
    {
      name: "aaa",
      id: "111",
      color: "black",
      position: 1,
      isMrx: true,
      inventory: inventory.mrx,
    },
    {
      name: "bbb",
      id: "222",
      color: "#63a4ff",
      position: 2,
      isMrx: false,
      inventory: inventory.detective,
    },
    {
      name: "ccc",
      id: "333",
      color: "#ffb347",
      position: 3,
      isMrx: false,
      inventory: inventory.detective,
    },
    {
      name: "ddd",
      id: "444",
      color: "red",
      position: 4,
      isMrx: false,
      inventory: inventory.detective,
    },
    {
      name: "eee",
      id: "555",
      color: "blue",
      position: 5,
      isMrx: false,
      inventory: inventory.detective,
    },
    {
      name: "fff",
      id: "666",
      color: "violet",
      position: 6,
      isMrx: false,
      inventory: inventory.detective,
    },
  ];
};

const getGame = (): Game => {
  return new Game(getGamePlayers());
};

describe("Static page", () => {
  it("should serve index page if player id valid", async () => {
    const playerManager = new PlayerManager(
      getIdGenerator(),
      new Map([["111", "Name"]]),
    );
    const lobbyManager = new LobbyManager(getIdGenerator());
    const gameManager = new GameManager();

    const app = createApp(playerManager, lobbyManager, gameManager);

    const headers = { cookie: `playerId=111` };

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

    const lobbyManager = new LobbyManager(getIdGenerator());
    const gameManager = new GameManager();

    lobbyManager.assignRoom({ id: "123", name: "Asma" });

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

    const lobbyManager = new LobbyManager(getIdGenerator());
    lobbyManager.assignRoom({ id: "111", name: "Janes1" });
    lobbyManager.assignRoom({ id: "222", name: "Janes2" });
    lobbyManager.assignRoom({ id: "333", name: "Janes3" });
    lobbyManager.assignRoom({ id: "444", name: "Janes4" });
    lobbyManager.assignRoom({ id: "555", name: "Janes5" });
    const gameManager = new GameManager();

    const app = createApp(playerManager, lobbyManager, gameManager);

    const res = await app.request("http://localhost:8000/lobby/quick-play", {
      headers: { "cookie": ` playerId=666` },
      method: "POST",
    });
    res.text();

    assertEquals(res.status, 302);
    assertEquals(res.headers.get("location"), "/waiting.html");
  });
});

describe("fetch players", () => {
  it("it should return all player names and isLobbyFull as false", async () => {
    const playerManager = new PlayerManager(
      getIdGenerator(),
      new Map([["111", "James"]]),
    );
    const lobbyManager = new LobbyManager(getIdGenerator());
    const roomId = lobbyManager.assignRoom({ id: "111", name: "James" }).roomId;
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

    const lobbyManager = new LobbyManager(getIdGenerator());
    const gameManager = new GameManager();

    const app = createApp(playerManager, lobbyManager, gameManager);

    const req = new Request("http://localhost:8000/lobby/room/status", {
      headers: { cookie: `playerId=111` },
    });
    const res = await app.request(req);

    assertEquals(res.status, 302);
    assertEquals(res.headers.get("location"), "/");
  });

  it("it should return isLobbyFull as true", async () => {
    const playerManager = new PlayerManager(
      getIdGenerator(),
      new Map([
        ["123", "a"],
      ]),
    );

    const lobbyManager = new LobbyManager(getIdGenerator());
    const gameManager = new GameManager(
      new Map(),
      new Map([
        ["123", "111"],
      ]),
    );

    const app = createApp(playerManager, lobbyManager, gameManager);

    const headers = { cookie: `roomId=111; playerId=123` };
    const req = new Request("http://localhost:8000/lobby/room/status", {
      headers,
    });
    const res = await app.request(req);

    assertEquals(res.status, 200);
    assertEquals(await res.json(), { isLobbyFull: true });
  });
});

describe("logout", () => {
  it("Should redirect to the login page after deleting cookie", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const playerId = playerManager.add("abc");
    const lobbyManager = new LobbyManager(getIdGenerator());
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
    const lobbyManager = new LobbyManager(getIdGenerator());

    const roomId =
      lobbyManager.assignRoom({ id: playerId, name: "abc" }).roomId;
    lobbyManager.assignRoom({ id: "2", name: "anc" });
    lobbyManager.assignRoom({ id: "3", name: "anc2" });
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
    const playerManager = new PlayerManager(
      getIdGenerator(),
      new Map([
        ["111", "aaa"],
      ]),
    );
    const lobbyManager = new LobbyManager(getIdGenerator());
    const gameManager = new GameManager(
      new Map([
        ["123", getGame()],
      ]),
    );

    const app = createApp(playerManager, lobbyManager, gameManager);

    const headers = { cookie: `gameId=123;playerId=111` };

    const res = await app.request("/game/move", {
      method: "POST",
      headers,
      body: JSON.stringify({ to: 8, ticket: "taxi" }),
    });

    assertEquals(res.status, 200);
    assertEquals(res.headers.get("content-type"), "application/json");
    const result = await res.json();
    assertEquals(result, { message: "Moved to 8" });
  });

  it("should say not your move when it is not your move", async () => {
    const playerManager = new PlayerManager(
      getIdGenerator(),
      new Map([
        ["111", "aaa"],
        ["222", "bbb"],
      ]),
    );

    const initialData: Players = [
      {
        name: "aaa",
        id: "111",
        color: "black",
        isMrx: true,
        position: 1,
        inventory: {
          tickets: { bus: 0, taxi: 4, underground: 3, black: 5 },
          cards: { doubleMove: 2 },
        },
      },
      {
        name: "bbb",
        id: "222",
        color: "#63a4ff",
        position: 2,
        isMrx: false,
        inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
      },
      {
        name: "ccc",
        id: "333",
        color: "#ffb347",
        position: 10,
        isMrx: false,
        inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
      },
      {
        name: "ddd",
        id: "444",
        color: "red",
        position: 4,
        isMrx: false,
        inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
      },
      {
        name: "eee",
        id: "555",
        color: "blue",
        position: 5,
        isMrx: false,
        inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
      },
      {
        name: "fff",
        id: "666",
        color: "violet",
        position: 6,
        isMrx: false,
        inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
      },
    ];

    const lobbyManager = new LobbyManager(getIdGenerator());
    const gameManager = new GameManager(
      new Map([["123", new Game(initialData)]]),
    );

    const app = createApp(playerManager, lobbyManager, gameManager);

    const headers = { cookie: `gameId=123;playerId=222` };

    const res = await app.request("/game/move", {
      method: "POST",
      headers,
      body: JSON.stringify({ to: 10, ticket: "taxi" }),
    });

    assertEquals(res.status, 403);
    assertEquals(res.headers.get("content-type"), "application/json");
    assertEquals(await res.json(), { message: "Not Your Move ..!" });
  });

  describe("serveGameStatus", () => {
    it("should return game status", async () => {
      const playerManager = new PlayerManager(
        getIdGenerator(),
        new Map([
          ["111", "aaa"],
          ["222", "bbb"],
        ]),
      );
      const lobbyManager = new LobbyManager(getIdGenerator());
      const game = getGame();
      const gameManager = new GameManager(new Map([["123", game]]));

      const gameStatus: GameStatus = {
        players: [
          {
            name: "aaa",
            id: "111",
            color: "black",
            isMrx: true,
            inventory: {
              tickets: { bus: 3, taxi: 4, underground: 3, black: 5 },
              cards: { doubleMove: 2 },
            },
            position: 10,
          },
          {
            name: "bbb",
            id: "222",
            color: "#63a4ff",
            position: 20,
            isMrx: false,
            inventory: { tickets: { bus: 8, taxi: 10, underground: 4 } },
          },
          {
            name: "ccc",
            id: "333",
            color: "#ffb347",
            position: 19,
            isMrx: false,
            inventory: { tickets: { bus: 8, taxi: 10, underground: 4 } },
          },
          {
            name: "ddd",
            id: "444",
            color: "red",
            position: 18,
            isMrx: false,
            inventory: { tickets: { bus: 8, taxi: 10, underground: 4 } },
          },
          {
            name: "eee",
            id: "555",
            color: "blue",
            position: 17,
            isMrx: false,
            inventory: { tickets: { bus: 8, taxi: 10, underground: 4 } },
          },
          {
            name: "fff",
            id: "666",
            color: "violet",
            position: 16,
            isMrx: false,
            inventory: { tickets: { bus: 8, taxi: 10, underground: 4 } },
          },
        ],
        mrXMoves: [
          { ticket: "taxi" },
          { ticket: "taxi" },
          { position: 10, ticket: "taxi" },
        ],
        you: 0,
        currentPlayer: 1,
        stations: {
          taxi: [8, 9],
          bus: [46, 58],
          underground: [46],
          black: [8, 9, 46, 58, 46],
        },
      };

      stub(game, "gameStatus", () => gameStatus);

      const app = createApp(playerManager, lobbyManager, gameManager);

      const res = await app.request("/game/status", {
        headers: { cookie: `gameId=123;playerId=111` },
      });

      assertEquals(res.status, 200);
      assertEquals(await res.json(), gameStatus);
    });
  });

  describe("Join user", () => {
    it("should add the player to exiting room when valid room is given", async () => {
      const playerManager = new PlayerManager(getIdGenerator());
      const playerId1 = playerManager.add("john");
      const playerId2 = playerManager.add("james");
      const lobbyManager = new LobbyManager(getIdGenerator());
      const roomId =
        lobbyManager.assignRoom({ id: playerId1, name: "john" }).roomId;
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
      const lobbyManager = new LobbyManager(getIdGenerator());
      const roomId =
        lobbyManager.assignRoom({ id: playerId1, name: "john" }).roomId;
      lobbyManager.assignRoom({ name: "mrxId", id: "1" });
      lobbyManager.assignRoom({ name: "d1", id: "5" });
      lobbyManager.assignRoom({ name: "d2", id: "2" });
      lobbyManager.assignRoom({ name: "d3", id: "3" });

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
});

describe("Host Game", () => {
  it("Should redirect to waiting page when player host a game", async () => {
    const playerManager = new PlayerManager(
      getIdGenerator(),
      new Map([["111", "James1"]]),
    );

    const lobbyManager = new LobbyManager(getIdGenerator());
    const gameManager = new GameManager();

    const app = createApp(playerManager, lobbyManager, gameManager);

    const headers = { cookie: `playerId=111` };

    const response = await app.request("/lobby/room/host", {
      method: "POST",
      headers,
    });

    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/waiting.html");
  });
});
