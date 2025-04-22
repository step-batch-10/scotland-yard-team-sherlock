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
  serveMockGameStatus,
} from "./handlers.ts";

import {
  checkGameStart,
  checkRoomRejoin,
  handleLoginAccess,
  validateGameId,
  validatePlayerId,
  validateRoomId,
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
  app.get("/login.html", handleLoginAccess);
  app.get("/waiting.html", validatePlayerId, validateRoomId);
  app.get("/game.html", validatePlayerId, validateGameId);

  app.post("/auth/login", login);
  app.get("/auth/logout", logout);

  app.post(
    "/lobby/quick-play",
    validatePlayerId,
    checkRoomRejoin,
    handleGameJoin,
  );
  app.get(
    "/lobby/room/status",
    validatePlayerId,
    checkGameStart,
    validateRoomId,
    fetchPlayers,
  );
  app.post("/lobby/room/leave", validatePlayerId, validateRoomId, leaveLobby);

  app.get("/game/details", validatePlayerId, validateGameId, assignRoles);
  app.get("/game/status", validatePlayerId, validateGameId, serveGameStatus);
  app.get("/game/mock-status", serveMockGameStatus);
  app.post("/game/move", validatePlayerId, validateGameId, makeMove);

  app.use("*", serveStatic({ root: "./public" }));

  return app;
};
