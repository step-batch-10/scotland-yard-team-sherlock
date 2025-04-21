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
  // addPlayerToGame,
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

  app.post("/auth/login", login);
  app.get("/auth/logout", validatePlayerSession, logout);
  app.get("/login.html", checkUserLogin);

  app.post("/lobby/join", validateJoin, handleGameJoin);
  app.get("/lobby/room/status", fetchPlayers);
  app.post("/lobby/room/leave", leaveLobby);

  app.get("/assign-roles", assignRoles);

  app.get("/game/status", validateGamePlayer, serveGameStatus);
  app.post("/game/move", validateGamePlayer, makeMove);

  app.use("*", serveStatic({ root: "./public" }));

  return app;
};
