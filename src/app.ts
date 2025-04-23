import { Context, Hono, Next } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import {
  assignRoles,
  handleGameJoin,
  joinUser,
  leaveLobby,
  login,
  logout,
  makeMove,
  serveGameStatus,
  serveIndex,
  serveRoomStatus,
  serveWaitingPage,
} from "./handlers.ts";

import {
  checkGameStart,
  checkRoomRejoin,
  handleLoginAccess,
  handleWaitingAccess,
  validateGameId,
  validateJoin,
  validatePlayerId,
  validateRoomId,
} from "./middlewares.ts";
import { PlayerManager } from "./models/playerManager.ts";
import { LobbyManager } from "./models/lobby.ts";
import { GameManager } from "./models/gameManager.ts";

export const createApp = (
  playerManager: PlayerManager,
  lobbyManager: LobbyManager,
  gameManager: GameManager,
) => {
  const app = new Hono();
  app.use(logger());

  app.use(async (context: Context, next: Next) => {
    context.set("playerManager", playerManager);
    context.set("lobbyManager", lobbyManager);
    context.set("gameManager", gameManager);
    await next();
  });

  app.get("/", validatePlayerId, serveIndex);
  app.get("/index.html", validatePlayerId, serveIndex);
  app.get("/login.html", handleLoginAccess);
  app.get(
    "/waiting.html",
    validatePlayerId,
    handleWaitingAccess,
    serveWaitingPage,
  );
  app.get("/game.html", validatePlayerId, validateGameId);

  app.post("/auth/login", login);
  app.get("/auth/logout", logout);

  app.post(
    "/lobby/quick-play",
    validatePlayerId,
    checkRoomRejoin,
    handleGameJoin,
  );
  app.post("/lobby/room/join", validatePlayerId, validateJoin, joinUser);
  app.get(
    "/lobby/room/status",
    validatePlayerId,
    checkGameStart,
    validateRoomId,
    serveRoomStatus,
  );
  app.post("/lobby/room/leave", validatePlayerId, validateRoomId, leaveLobby);

  app.get("/game/details", validatePlayerId, validateGameId, assignRoles);
  app.get("/game/status", validatePlayerId, validateGameId, serveGameStatus);
  app.post("/game/move", validatePlayerId, validateGameId, makeMove);

  app.use("*", serveStatic({ root: "./public" }));

  return app;
};
