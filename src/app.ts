import { Context, Hono, Next } from "hono";
import { serveStatic } from "hono/deno";
import {
  handleGameJoin,
  handleWaitingReq,
  login,
  serveIndex,
  serveLoginPage,
} from "./handlers.ts";
import { checkUserLogin, validatePlayerSession } from "./middlewares.ts";
import { PlayerSessions } from "./models/playerSessions.ts";
import { Lobby } from "./models/lobby.ts";

export const createApp = (playerSessions: PlayerSessions, lobby: Lobby) => {
  const app = new Hono();

  app.use(async (context: Context, next: Next) => {
    context.set("playerSessions", playerSessions);
    context.set("lobby", lobby);
    await next();
  });

  app.get("/", validatePlayerSession, serveIndex);
  app.get("/index.html", validatePlayerSession, serveIndex);

  app.post("/login", login);
  app.get("/login.html", checkUserLogin, serveLoginPage);

  app.post("/game/join", handleGameJoin);
  app.get("/waiting-players", handleWaitingReq);
  app.use("*", serveStatic({ root: "./public" }));

  return app;
};
