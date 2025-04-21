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
  checkRoomRejoin,
  handleLoginAccess,
  validateGameId,
  validatePlayerId,
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

  app.get("/", validatePlayerId, serveIndex);
  app.get("/index.html", validatePlayerId, serveIndex);

  app.post("/auth/login", login);
  app.get("/auth/logout", validatePlayerId, logout);
  app.get("/login.html", handleLoginAccess);

  app.post("/lobby/join", checkRoomRejoin, handleGameJoin);
  app.get("/lobby/room/status", fetchPlayers);
  app.post("/lobby/room/leave", leaveLobby);

  app.get("/game/details", assignRoles);
  app.get("/game/status", validateGameId, serveGameStatus);
  app.post("/game/move", validateGameId, makeMove);

  app.use("*", serveStatic({ root: "./public" }));

  return app;
};
