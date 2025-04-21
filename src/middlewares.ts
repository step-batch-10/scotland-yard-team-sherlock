import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { PlayerSessions } from "./models/playerSessions.ts";
import { LobbyManager } from "./models/lobby.ts";

export const validatePlayerId = async (context: Context, next: Next) => {
  const playerId = getCookie(context, "playerId");
  if (!playerId) return context.redirect("/login.html");

  const playerSessions: PlayerSessions = context.get("playerSessions");
  const playerName = playerSessions.getPlayer(playerId);
  if (!playerName) return context.redirect("/login.html");

  context.set("playerName", playerName);
  context.set("playerId", playerId);
  return await next();
};

export const handleLoginAccess = async (context: Context, next: Next) => {
  const playerId = getCookie(context, "playerId");

  const playerSessions: PlayerSessions = context.get("playerSessions");
  const playerName = playerSessions.getPlayer(playerId || "");

  if (playerName) return context.redirect("/");

  return await next();
};

export const validateGameId = async (context: Context, next: Next) => {
  const gameId = getCookie(context, "gameId");
  if (!gameId) return context.redirect("/");
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
