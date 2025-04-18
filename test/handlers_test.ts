import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { createApp } from "../src/app.ts";
import { PlayerSessions } from "../src/models/playerSessions.ts";
import { Lobby } from "../src/models/lobby.ts";

describe("Static page", () => {
  it("Should return index page", async () => {
    const playerSessions = new PlayerSessions();
    playerSessions.createSession("detective1");
    const lobby = new Lobby();
    const app = createApp(playerSessions, lobby);

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
    const lobby = new Lobby();
    const app = createApp(playerSessions, lobby);

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
    const lobby = new Lobby();
    lobby.add("a");
    const app = createApp(playerSessions, lobby);
    const players = ["a"];
    const isLobbyFull = false;
    const req = new Request("http://localhost:8000/fetch-players");
    const res = await app.request(req);
    assertEquals(await res.json(), { players, isLobbyFull });
    assertEquals(res.status, 200);
  });

  it("it should return allPlayer names and isLobbyFull as true", async () => {
    const playerSessions = new PlayerSessions();
    const lobby = new Lobby();
    lobby.add("a");
    lobby.add("b");
    lobby.add("c");
    lobby.add("d");
    lobby.add("e");
    lobby.add("f");
    const app = createApp(playerSessions, lobby);
    const players = ["a", "b", "c", "d", "e", "f"];
    const isLobbyFull = true;
    const req = new Request("http://localhost:8000/fetch-players");
    const res = await app.request(req);
    assertEquals(await res.json(), { players, isLobbyFull });
    assertEquals(res.status, 200);
  });

  it("it should assign roles and colors", async () => {
    const players = [
      { name: "A", role: "Detective", color: "yellow" },
      { name: "B", role: "Detective", color: "green" },
      { name: "C", role: "Mr X", color: "black" },
      { name: "D", role: "Detective", color: "red" },
      { name: "E", role: "Detective", color: "blue" },
      { name: "F", role: "Detective", color: "violet" },
    ];
    const playerSessions = new PlayerSessions();
    const lobby = new Lobby();
    lobby.add("A");
    lobby.add("B");
    lobby.add("C");
    lobby.add("D");
    lobby.add("E");
    lobby.add("F");
    const app = createApp(playerSessions, lobby);

    const req = new Request("http://localhost:8000/assign-roles");
    const res = await app.request(req);
    assertEquals(await res.json(), players);
    assertEquals(res.status, 200);
  });
});

describe("Server player positions", () => {
  it("should give users list with postion and color", async () => {
    const playerSessions = new PlayerSessions();
    const lobby = new Lobby();

    const app = createApp(playerSessions, lobby);

    const resp = await app.request("/game/player-positions");

    assertEquals(resp.status, 200);
    assertEquals(await resp.json(), [
      { position: 6, color: "red" },
      { position: 12, color: "blue" },
      { position: 15, color: "yellow" },
      { position: 24, color: "green" },
      { position: 30, color: "white" },
      { position: 27, color: "purple" },
    ]);
  });
});

describe("logout", () => {
  it("Should redirect to the login page after deleting cookie", async () => {
    const playerSessions = new PlayerSessions();
    const lobby = new Lobby();

    const playerId = playerSessions.createSession("player1");

    const app = createApp(playerSessions, lobby);

    const headers = { cookie: `playerSessionId=${playerId}` };

    const res = await app.request("/logout", { headers });

    assertEquals(res.status, 302);
    assertEquals(res.headers.get("location"), "/login.html");
  });
});
