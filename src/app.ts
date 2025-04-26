import { Context, Hono, Next } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import {
  handleHostGame,
  handleLeaveLobby,
  handleLogin,
  handleLogout,
  handleMove,
  handleQuickJoin,
  handleRoomJoin,
  serveGameInitialDetails,
  serveGameStatus,
  serveIndex,
  serveRoomStatus,
  serveWaitingPage,
} from "./handlers.ts";

import {
  ensureGameStart,
  ensureNotLoggedInPlayer,
  ensureValidGameId,
  ensureValidJoin,
  ensureValidPlayer,
  ensureValidRoomId,
  handleWaitingAccess,
  redirectIfHasRoom,
} from "./middlewares.ts";
import { PlayerManager } from "./models/playerManager.ts";
import { LobbyManager } from "./models/lobbyManager.ts";
import { GameManager } from "./models/gameManager.ts";

const createLobbyRoutes = () => {
  const app = new Hono();

  app.use(ensureValidPlayer);

  app.post("/quick-play", redirectIfHasRoom, handleQuickJoin);
  app.post("/room/join", ensureValidJoin, handleRoomJoin);
  app.post("/room/host", handleHostGame);

  app.use("/room/status", ensureGameStart);
  app.use(ensureValidRoomId);

  app.get("/room/status", serveRoomStatus);
  app.post("/room/leave", handleLeaveLobby);

  return app;
};

const createGameRoutes = () => {
  const app = new Hono();

  app.use(ensureValidPlayer, ensureValidGameId);

  app.get("/details", serveGameInitialDetails);
  app.post("/move", handleMove);
  app.get("/status", serveGameStatus);

  return app;
};

const injectData = (
  playerManager: PlayerManager,
  lobbyManager: LobbyManager,
  gameManager: GameManager,
) => {
  return async (context: Context, next: Next) => {
    context.set("playerManager", playerManager);
    context.set("lobbyManager", lobbyManager);
    context.set("gameManager", gameManager);

    await next();
  };
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

  app.use("*", injectData(playerManager, lobbyManager, gameManager));

  app.get("/", ensureValidPlayer, serveIndex);
  app.get("/index.html", ensureValidPlayer, serveIndex);
  app.use("/login.html", ensureNotLoggedInPlayer);
  app
    .get(
      "/waiting.html",
      ensureValidPlayer,
      handleWaitingAccess,
      serveWaitingPage,
    );

  app.use("/game.html", ensureValidPlayer, ensureValidGameId);

  app.post("/auth/login", handleLogin);
  app.get("/auth/logout", handleLogout);

  app.route("/lobby", lobbyRoutes);
  app.route("/game", gameRoutes);

  app.use("*", serveStatic({ root: "./public" }));

  return app;
};
