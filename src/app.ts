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

const createLobbyRoutes = () => {
  const app = new Hono();

  app.use(validatePlayerId);

  app.post("/quick-play", checkRoomRejoin, handleGameJoin);
  app.post("/room/join", validateJoin, joinUser);

  app.use("/room/status", checkGameStart);
  app.use(validateRoomId);

  app.get("/room/status", serveRoomStatus);
  app.post("/room/leave", leaveLobby);

  return app;
};

const createGameRoutes = () => {
  const app = new Hono();

  app.use(validatePlayerId, validateGameId);

  app.get("/details", assignRoles);
  app.post("/move", makeMove);
  app.get("/status", serveGameStatus);

  return app;
};

export const createApp = (
  playerManager: PlayerManager,
  lobbyManager: LobbyManager,
  gameManager: GameManager,
) => {
  const app = new Hono();
  app.use(logger());

  const lobbyRoutes = createLobbyRoutes();
  const gameRoutes = createGameRoutes();

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
  app.use("/game.html", validatePlayerId, validateGameId);

  app.post("/auth/login", login);
  app.get("/auth/logout", logout);

  app.route("/lobby", lobbyRoutes);
  app.route("/game", gameRoutes);

  app.use("*", serveStatic({ root: "./public" }));

  return app;
};
