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
    lobby.addPlayer("1", "a");
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
    lobby.addPlayer("1", "Asma");
    lobby.addPlayer("2", "Deepanshu");
    lobby.addPlayer("3", "favas");
    lobby.addPlayer("4", "anagh");
    lobby.addPlayer("5", "sanika");
    lobby.addPlayer("6", "bhanu");
    const app = createApp(playerSessions, lobby);
    const players = ["Asma", "Deepanshu", "favas", "anagh", "sanika", "bhanu"];
    const isLobbyFull = true;
    const req = new Request("http://localhost:8000/fetch-players");
    const res = await app.request(req);
    assertEquals(await res.json(), { players, isLobbyFull });
    assertEquals(res.status, 200);
  });

  it("it should assign roles and colors", async () => {
    const players = [
      { name: "Asma", role: "Detective", color: "yellow" },
      { name: "Deepanshu", role: "Detective", color: "green" },
      { name: "favas", role: "Mr X", color: "black" },
      { name: "anagh", role: "Detective", color: "red" },
      { name: "sanika", role: "Detective", color: "blue" },
      { name: "bhanu", role: "Detective", color: "violet" },
    ];
    const playerSessions = new PlayerSessions();
    const lobby = new Lobby();
    lobby.addPlayer("1", "Asma");
    lobby.addPlayer("2", "Deepanshu");
    lobby.addPlayer("3", "favas");
    lobby.addPlayer("4", "anagh");
    lobby.addPlayer("5", "sanika");
    lobby.addPlayer("6", "bhanu");
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

describe("leave lobby", () => {
  it("should remove the player from lobby and redirect to home page", async () => {
    const playerSessions = new PlayerSessions();
    const lobby = new Lobby();
    lobby.addPlayer("1", "Asma");
    lobby.addPlayer("2", "Deepanshu");
    lobby.addPlayer("3", "favas");
    const app = createApp(playerSessions, lobby);
    const req = new Request("http://localhost:8000/leave-lobby", {
      method: "POST",
      headers: { cookie: "playerSessionId=1" },
    });
    const res = await app.request(req);
    const expected = "/";
    const actual = await res.text();
    assertEquals(actual, expected);
    assertEquals(lobby.players.length, 2);
  });
});
