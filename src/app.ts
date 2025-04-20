import { Context, Hono, Next } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import {
  assignRoles,
  fetchPlayers,
  handleGameJoin,
  leaveLobby,
  login,
  logout,
  makeMove,
  serveGameStatus,
  serveIndex,
} from "./handlers.ts";

import {
  addPlayerToGame,
  checkUserLogin,
  validateGamePlayer,
  validateJoin,
  validatePlayerSession,
} from "./middlewares.ts";
import { PlayerSessions } from "./models/playerSessions.ts";
import { LobbyManager } from "./models/lobby.ts";
import { GameManager } from "./models/gameManager.ts";

export const createApp = (
  playerSessions: PlayerSessions,
  lobbyManager: LobbyManager,
  gameManager: GameManager,
) => {
  const app = new Hono();
  app.use(logger());
  app.use(async (context: Context, next: Next) => {
    context.set("playerSessions", playerSessions);
    context.set("lobbyManager", lobbyManager);
    context.set("gameManager", gameManager);
    await next();
  });

  app.get("/", validatePlayerSession, serveIndex);
  app.get("/index.html", validatePlayerSession, serveIndex);

  app.post("/login", login);
  app.get("/logout", validatePlayerSession, logout);
  app.get("/login.html", checkUserLogin);

  app.post("/game/join", validateJoin, handleGameJoin);
  app.get("/fetch-players", fetchPlayers);
  app.get("/assign-roles", assignRoles);

  app.get("/game.html", addPlayerToGame);
  app.post("/leave-lobby", leaveLobby);

  app.get("/game/status", validateGamePlayer, serveGameStatus);
  app.post("/game/move", validateGamePlayer, makeMove);

  app.use("*", serveStatic({ root: "./public" }));

  return app;
};
