import { Context, Hono, Next } from "hono";
import { serveStatic } from "hono/deno";
import {
  handleGameJoin,
  login,
  serveIndex,
  serveLoginPage,
} from "./handlers.ts";
import { checkUserLogin, validatePlayerSession } from "./middlewares.ts";
import { PlayerSessions } from "./models/playerSessions.ts";

export const createApp = (playerSessions: PlayerSessions) => {
  const app = new Hono();

  app.use(async (context: Context, next: Next) => {
    context.set("playerSessions", playerSessions);
    await next();
  });

  app.get("/", validatePlayerSession, serveIndex);

  app.post("/login", login);
  app.get("/login.html", checkUserLogin, serveLoginPage);

  app.post("/game/join", handleGameJoin);
  app.use("*", serveStatic({ root: "./public" }));

  return app;
};
