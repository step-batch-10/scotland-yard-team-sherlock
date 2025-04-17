import { assertEquals } from "assert";
import { describe, test } from "testing/bdd";
import { createApp } from "../src/app.ts";
import { PlayerSessions } from "../src/models/playerSessions.ts";
import { Lobby } from "../src/models/lobby.ts";

describe("Static page", () => {
  test("Should return join.html static page", async () => {
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
  test("Should redirect to waiting page", async () => {
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
    test("Should return waiting players and lobby status in json format", async () => {
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
