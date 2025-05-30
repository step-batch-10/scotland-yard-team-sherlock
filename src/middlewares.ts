import { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { LobbyManager } from "./models/lobbyManager.ts";
import { GameManager } from "./models/gameManager.ts";
import { PlayerManager } from "./models/playerManager.ts";

export const ensureValidJoin = async (context: Context, next: Next) => {
  const formData: FormData = await context.req.formData();
  const roomId = formData.get("room-id") as string;

  const lobbyManager: LobbyManager = context.get("lobbyManager");

  if (lobbyManager.getRoom(roomId as string)) {
    context.set("roomId", roomId);
    setCookie(context, "roomId", roomId);
    return await next();
  }

  context.status(403);
  return context.json({ error: "invalid room id" });
};

export const ensureValidPlayer = async (context: Context, next: Next) => {
  const playerId = getCookie(context, "playerId");

  if (!playerId) return context.redirect("/login.html");

  const playerManager: PlayerManager = context.get("playerManager");
  const playerName = playerManager.get(playerId);
  if (!playerName) return context.redirect("/login.html");

  context.set("playerName", playerName);
  context.set("playerId", playerId);
  return await next();
};

export const ensureNotLoggedInPlayer = async (context: Context, next: Next) => {
  const playerId = getCookie(context, "playerId");

  const playerManager: PlayerManager = context.get("playerManager");
  const playerName = playerManager.get(playerId || "");

  if (playerName) return context.redirect("/");

  return await next();
};

export const handleWaitingAccess = async (context: Context, next: Next) => {
  const playerId = context.get("playerId");
  const roomId = getCookie(context, "roomId");

  if (!roomId) return context.redirect("/");

  const lobbyManager: LobbyManager = context.get("lobbyManager");
  const gameManager: GameManager = context.get("gameManager");

  const room = lobbyManager.getRoom(roomId);
  const gameId = gameManager.getGameId(playerId!);

  if (!room && !gameId) return context.redirect("/");

  context.set("roomId", roomId);

  return await next();
};

export const ensureValidRoomId = async (context: Context, next: Next) => {
  const roomId = getCookie(context, "roomId");

  if (!roomId) return context.redirect("/");

  const lobbyManager: LobbyManager = context.get("lobbyManager");
  const room = lobbyManager.getRoom(roomId);

  if (!room) return context.redirect("/");

  context.set("roomId", roomId);
  context.set("room", room);

  return await next();
};

export const ensureValidGameId = async (context: Context, next: Next) => {
  const gameId = getCookie(context, "gameId");
  if (!gameId) return context.redirect("/waiting.html");

  const gameManager: GameManager = context.get("gameManager");
  const game = gameManager.getGame(gameId);

  if (!game) return context.redirect("/waiting.html");

  context.set("game", game);
  context.set("gameId", gameId);

  return await next();
};

export const redirectIfHasRoom = async (context: Context, next: Next) => {
  const roomId = getCookie(context, "roomId");
  const lobbyManager: LobbyManager = context.get("lobbyManager");

  const room = lobbyManager.getRoom(roomId!);
  if (!room) return await next();

  return context.redirect("/waiting.html");
};

export const ensureGameStart = async (context: Context, next: Next) => {
  const playerId = context.get("playerId");

  const gameManager: GameManager = context.get("gameManager");
  const gameId = gameManager.getGameId(playerId!);

  if (!gameId) return await next();

  deleteCookie(context, "roomId");
  setCookie(context, "gameId", gameId!);

  return context.json({ isLobbyFull: true });
};
