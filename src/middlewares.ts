import { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { LobbyManager } from "./models/lobby.ts";
import { GameManager } from "./models/gameManager.ts";
import { PlayerManager } from "./models/playerManager.ts";

export const validateJoin = async (context: Context, next: Next) => {
  const fd: FormData = await context.req.formData();
  const roomId = fd.get("room-id");
  context.set("roomId", roomId);
  const lobbyManager: LobbyManager = context.get("lobbyManager");

  if (lobbyManager.hasRoom(roomId as string)) {
    setCookie(context, "roomId", roomId as string);
    return await next();
  }

  context.status(403);
  return context.json({ error: "invalid room id" });
};

export const validatePlayerId = async (context: Context, next: Next) => {
  const playerId = getCookie(context, "playerId");

  if (!playerId) return context.redirect("/login.html");

  const playerManager: PlayerManager = context.get("playerManager");
  const playerName = playerManager.getPlayer(playerId);
  if (!playerName) return context.redirect("/login.html");

  context.set("playerName", playerName);
  context.set("playerId", playerId);
  return await next();
};

export const handleLoginAccess = async (context: Context, next: Next) => {
  const playerId = getCookie(context, "playerId");

  const playerManager: PlayerManager = context.get("playerManager");
  const playerName = playerManager.getPlayer(playerId || "");

  if (playerName) return context.redirect("/");

  return await next();
};

export const handleWaitingAccess = async (context: Context, next: Next) => {
  const playerId = context.get("playerId");
  const roomId = getCookie(context, "roomId");

  if (!roomId) return context.redirect("/");

  const lobbyManager: LobbyManager = context.get("lobbyManager");
  const room = lobbyManager.getRoom(roomId);
  const gameId = lobbyManager.getGameId(playerId!);

  if (!room && !gameId) return context.redirect("/");

  context.set("roomId", roomId);

  return await next();
};

export const validateRoomId = async (context: Context, next: Next) => {
  const roomId = getCookie(context, "roomId");

  if (!roomId) return context.redirect("/");

  const lobbyManager: LobbyManager = context.get("lobbyManager");
  const room = lobbyManager.getRoom(roomId);

  if (!room) return context.redirect("/");

  context.set("roomId", roomId);
  context.set("room", room);

  return await next();
};

export const validateGameId = async (context: Context, next: Next) => {
  const gameId = getCookie(context, "gameId");
  if (!gameId) return context.redirect("/waiting.html");

  const gameManager: GameManager = context.get("gameManager");
  const game = gameManager.getGame(gameId);

  if (!game) return context.redirect("/waiting.html");

  context.set("game", game);
  context.set("gameId", gameId);

  return await next();
};

export const checkRoomRejoin = async (context: Context, next: Next) => {
  const roomId = getCookie(context, "roomId");
  const lobbyManager: LobbyManager = context.get("lobbyManager");

  const room = lobbyManager.getRoom(roomId!);
  if (!room) return await next();

  return context.redirect("/waiting.html");
};

export const checkGameStart = async (context: Context, next: Next) => {
  const playerId = context.get("playerId");

  const lobbyManager: LobbyManager = context.get("lobbyManager");
  const gameId = lobbyManager.getGameId(playerId!);

  if (!gameId) return await next();

  deleteCookie(context, "roomId");
  setCookie(context, "gameId", gameId!);

  return context.json({ isLobbyFull: true });
};
