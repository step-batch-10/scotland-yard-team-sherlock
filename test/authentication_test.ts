import { assert, assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { PlayerManager } from "../src/models/playerManager.ts";
import { createApp } from "../src/app.ts";
import { LobbyManager } from "../src/models/lobbyManager.ts";
import { GameManager } from "../src/models/gameManager.ts";
import { getIdGenerator } from "../src/models/playerManager.ts";

export const createAppWithPlayers = (loggedInUser: string) => {
  const playerManager = new PlayerManager(
    getIdGenerator(),
    new Map([["111", loggedInUser]]),
  );
  const lobbyManager = new LobbyManager(getIdGenerator());
  const gameManager = new GameManager();

  const app = createApp(
    playerManager,
    lobbyManager,
    gameManager,
  );
  return app;
};

describe("Authentication", () => {
  describe("validatePlayerSession", () => {
    it("should redirect to login page if no playerId provided", async () => {
      const app = createAppWithPlayers("John");

      const response = await app.request("/");

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/login.html");
    });

    it("should redirect to login page if playerId doesn't exists in sessions", async () => {
      const app = createAppWithPlayers("player1");

      const response = await app.request("/", {
        headers: { cookie: "playerId=123456" },
      });

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/login.html");
    });

    it("should give home page if valid playerId exists", async () => {
      const app = createAppWithPlayers("John");

      const response = await app.request("/", {
        headers: { cookie: "playerId=111" },
      });

      assertEquals(response.status, 200);
    });
  });
});

describe("login", () => {
  it("should add new player to playerManager and redirect to home", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const lobbyManager = new LobbyManager(getIdGenerator());
    const gameManager = new GameManager();

    const app = createApp(
      playerManager,
      lobbyManager,
      gameManager,
    );

    const formData = new FormData();
    formData.set("name", "John");

    const request = new Request("http://localhost:8000/auth/login", {
      body: formData,
      method: "POST",
    });

    const response = await app.request(request);

    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/");
    assertEquals(playerManager.players.size, 1);
    assert(response.headers.has("set-cookie"));
  });
});

describe("checkUserLogin", () => {
  it("should redirect to root if user already logged in", async () => {
    const app = createAppWithPlayers("John");
    const request = new Request("http://localhost:8000/login.html", {
      headers: { cookie: "playerId=111" },
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
