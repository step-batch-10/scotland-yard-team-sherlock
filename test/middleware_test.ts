import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { getIdGenerator, PlayerManager } from "../src/models/playerManager.ts";
import { LobbyManager } from "../src/models/lobbyManager.ts";
import { GameManager } from "../src/models/gameManager.ts";
import { createApp } from "../src/app.ts";

describe("validations", () => {
  it("Should return to login page. If gameId and playerId cookie is not available.", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const lobbyManager = new LobbyManager(getIdGenerator());
    const gameManager = new GameManager();
    const app = createApp(playerManager, lobbyManager, gameManager);

    const response = await app.request("/game/status");

    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/login.html");
  });

  it("Should return to waiting page. If gameId cookie is not available.", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const playerId = playerManager.add("NAME");
    const lobbyManager = new LobbyManager(getIdGenerator());
    const roomId = lobbyManager.assignRoom({ id: playerId, name: "NAME" });
    const gameManager = new GameManager();
    const app = createApp(playerManager, lobbyManager, gameManager);

    const headers = { cookie: ` playerId=${playerId}; roomId=${roomId}` };
    const response = await app.request("/game/status", { headers });

    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/waiting.html");
  });

  it("Should return to waiting page if roomId available.", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const playerId = playerManager.add("abc");
    const lobbyManager = new LobbyManager(getIdGenerator());
    const gameManager = new GameManager();
    const roomId: string =
      lobbyManager.assignRoom({ id: playerId, name: "James" }).roomId;
    const app = createApp(playerManager, lobbyManager, gameManager);

    const response = await app.request("/lobby/quick-play", {
      method: "POST",
      headers: { cookie: `roomId=${roomId} ;playerId=${playerId}` },
    });

    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/waiting.html");
  });

  it("should redirect to waiting page if invalid gameId present", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const playerId = playerManager.add("Name");

    const lobbyManager = new LobbyManager(getIdGenerator());
    const gameManager = new GameManager();

    lobbyManager.assignRoom({ id: "1", name: "Name" });
    lobbyManager.assignRoom({ id: "2", name: "James2" });
    lobbyManager.assignRoom({ id: "3", name: "James3" });
    lobbyManager.assignRoom({ id: "4", name: "James4" });
    lobbyManager.assignRoom({ id: "5", name: "James5" });
    lobbyManager.assignRoom({ id: "6", name: "James6" });
    const app = createApp(playerManager, lobbyManager, gameManager);

    const response = await app.request("/game/status", {
      headers: { cookie: `gameId=123; playerId=${playerId}` },
    });
    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/waiting.html");
  });

  it("should redirect to waiting page room already exists", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const playerId = playerManager.add("Name");

    const lobbyManager = new LobbyManager(getIdGenerator());
    const roomId = lobbyManager.assignRoom({ id: playerId, name: "Name" });

    const gameManager = new GameManager();
    const app = createApp(playerManager, lobbyManager, gameManager);

    const response = await app.request("/lobby/quick-play", {
      method: "POST",
      headers: { cookie: `roomId=${roomId}; playerId=${playerId}` },
    });
    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/waiting.html");
  });

  it("should return invalid room id message if the room is invalid when joining", async () => {
    const playerManager = new PlayerManager(getIdGenerator());
    const playerId = playerManager.add("Name");

    const lobbyManager = new LobbyManager(getIdGenerator());

    const gameManager = new GameManager();
    const app = createApp(playerManager, lobbyManager, gameManager);

    const fd = new FormData();
    fd.set("room-id", "123");
    const response = await app.request("/lobby/room/join", {
      method: "POST",
      body: fd,
      headers: { cookie: `playerId=${playerId}` },
    });

    assertEquals(response.status, 403);
    assertEquals(await response.json(), { error: "invalid room id" });
  });

  describe("handleWaitingAccess", () => {
    it("should redirect to home if no room id present in cookie", async () => {
      const playerManager = new PlayerManager(getIdGenerator());
      const playerId = playerManager.add("Name");

      const lobbyManager = new LobbyManager(getIdGenerator());
      lobbyManager.assignRoom({ name: "Name", id: playerId });

      const gameManager = new GameManager();

      const app = createApp(playerManager, lobbyManager, gameManager);

      const response = await app.request("/waiting.html", {
        headers: { "cookie": `playerId=${playerId}` },
      });

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/");
    });

    it("should redirect to home if both room and gameid is invalid", async () => {
      const playerManager = new PlayerManager(getIdGenerator());
      const playerId = playerManager.add("Name");

      const lobbyManager = new LobbyManager(getIdGenerator());
      lobbyManager.assignRoom({ name: "Name", id: playerId });

      const gameManager = new GameManager();

      const app = createApp(playerManager, lobbyManager, gameManager);

      const response = await app.request("/waiting.html", {
        headers: { "cookie": `playerId=${playerId}; roomId=123` },
      });

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/");
    });

    it("should return waiting page if roomId is valid", async () => {
      const playerManager = new PlayerManager(getIdGenerator());
      const playerId = playerManager.add("Name");

      const lobbyManager = new LobbyManager(getIdGenerator());
      const { roomId } = lobbyManager.assignRoom({
        name: "Name",
        id: playerId,
      });

      const gameManager = new GameManager();

      const app = createApp(playerManager, lobbyManager, gameManager);

      const response = await app.request("/waiting.html", {
        headers: { "cookie": `playerId=${playerId}; roomId=${roomId}` },
      });

      assertEquals(response.status, 200);
    });

    it("should return waiting page if roomId is invalid but gameId is present", async () => {
      const playerManager = new PlayerManager(getIdGenerator());
      const playerId = playerManager.add("Name");

      const lobbyManager = new LobbyManager(getIdGenerator());
      lobbyManager.assignRoom({ name: "Name1", id: playerId });
      lobbyManager.assignRoom({ name: "Name2", id: "2" });
      lobbyManager.assignRoom({ name: "Name3", id: "3" });
      lobbyManager.assignRoom({ name: "Name4", id: "4" });
      lobbyManager.assignRoom({ name: "Name5", id: "5" });
      lobbyManager.assignRoom({ name: "Name6", id: "6" });

      const gameManager = new GameManager();

      const app = createApp(playerManager, lobbyManager, gameManager);

      const response = await app.request("/waiting.html", {
        headers: { "cookie": `playerId=${playerId}; roomId=112` },
      });

      assertEquals(response.status, 302);
    });

    it("should return to home page if roomId is present but invalid", async () => {
      const playerManager = new PlayerManager(
        getIdGenerator(),
        new Map([["111", "Name"]]),
      );
      const lobbyManager = new LobbyManager(getIdGenerator());
      const gameManager = new GameManager();

      const app = createApp(playerManager, lobbyManager, gameManager);

      const response = await app.request("/lobby/room/status", {
        headers: {
          "cookie": "roomId=111; playerId=111",
        },
      });

      assertEquals(response.headers.get("location"), "/");
      assertEquals(response.status, 302);
    });
  });
});
