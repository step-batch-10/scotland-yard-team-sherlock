import { Context, Hono, Next } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import {
  assignRoles,
  fetchPlayers,
  handleGameJoin,
  handlePlayerPositions,
  leaveLobby,
  login,
  logout,
  serveGamePage,
  serveIndex,
  serveLoginPage,
} from "./handlers.ts";

import { checkUserLogin, validatePlayerSession } from "./middlewares.ts";
import { PlayerSessions } from "./models/playerSessions.ts";
import { Lobby, LobbyManager } from "./models/lobby.ts";
import { GameManager } from "./models/gameManager.ts";

export const createApp = (
  playerSessions: PlayerSessions,
  lobby: Lobby,
  lobbyManager: LobbyManager,
  gameManager: GameManager,
) => {
  const app = new Hono();
  app.use(logger());
  app.use(async (context: Context, next: Next) => {
    context.set("playerSessions", playerSessions);
    context.set("lobby", lobby);
    context.set("lobbyManager", lobbyManager);
    context.set("gameManager", gameManager);
    await next();
  });

  app.get("/", validatePlayerSession, serveIndex);
  app.get("/index.html", validatePlayerSession, serveIndex);

  app.post("/login", login);
  app.get("/logout", validatePlayerSession, logout);
  app.get("/login.html", checkUserLogin, serveLoginPage);

  app.post("/game/join", handleGameJoin);
  app.get("/fetch-players", fetchPlayers);
  app.get("/assign-roles", assignRoles);

  app.get("/game.html", serveGamePage);
  app.post("/leave-lobby", leaveLobby);
  app.get("/game/player-positions", handlePlayerPositions);

  app.use("*", serveStatic({ root: "./public" }));

  return app;
};
