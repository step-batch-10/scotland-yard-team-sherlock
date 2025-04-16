import { assert, assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { PlayerSessions } from "../src/models/playerSessions.ts";
import { createApp } from "../src/app.ts";

describe("Authentication", () => {
  describe("validatePlayerSession", () => {
    it("should redirect to login page if no playerSessionId provided", async () => {
      const playerSessions = new PlayerSessions();
      const app = createApp(playerSessions);

      const response = await app.request("/");

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/login.html");
    });

    it("should redirect to login page if playerSesionId doesn't exists in sessions", async () => {
      const playerSessions = new PlayerSessions();
      const app = createApp(playerSessions);

      const response = await app.request("/", {
        headers: { cookie: "playerSessionId=123456789" },
      });

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/login.html");
    });

    it("should give home page if valid playerSessionId exists", async () => {
      const playerSessions = new PlayerSessions();
      playerSessions.add("123456", "PlayerName1");

      const app = createApp(playerSessions);

      const response = await app.request("/", {
        headers: { cookie: "playerSessionId=123456" },
      });

      assertEquals(response.status, 200);
    });
  });

  describe("login", () => {
    it("should add new player to playerSessions and redirect to home", async () => {
      const playerSessions = new PlayerSessions();
      const app = createApp(playerSessions);

      const formData = new FormData();
      formData.set("player-name", "PlayerName1");

      const request = new Request("http://localhost:8000/login", {
        body: formData,
        method: "POST",
      });

      const response = await app.request(request);

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/");
      assertEquals(playerSessions.sessions.size, 1);
      assert(response.headers.has("set-cookie"));
    });
  });
});
