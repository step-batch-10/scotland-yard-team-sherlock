import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { createApp } from "../src/app.ts";
import { PlayerSessions } from "../src/models/playerSessions.ts";
import { Lobby } from "../src/models/lobby.ts";

describe("Static page", () => {
  it("Should return join.html static page", async () => {
    const playerSessions = new PlayerSessions();
    const lobby = new Lobby();
    const app = createApp(playerSessions, lobby);

    const res = await app.request("http://localhost:8000/join.html");
    res.text();

    assertEquals(res.status, 200);
    assertEquals(res.headers.get("content-type"), "text/html; charset=utf-8");
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

  describe("Waiting Player Data", () => {
    it("Should return waiting players and lobby status in json format", async () => {
      const playerSessions = new PlayerSessions();
      const lobby = new Lobby();
      const app = createApp(playerSessions, lobby);

      const res = await app.request("http://localhost:8000/waiting-players");
      await res.json();

      assertEquals(res.status, 200);
      assertEquals(res.headers.get("content-type"), "application/json");
    });
  });
});

describe("fetch players", () => {
  it("it should return allPlayer names", async () => {
    const playerSessions = new PlayerSessions();
    const lobby = new Lobby();
    const app = createApp(playerSessions, lobby);
    const players = ["A", "B", "C", "D", "E", "F"];
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
    const app = createApp(playerSessions, lobby);

    const req = new Request("http://localhost:8000/assign-roles");
    const res = await app.request(req);
    assertEquals(await res.json(), players);
    assertEquals(res.status, 200);
  });
});
