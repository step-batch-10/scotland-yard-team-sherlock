import { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { PlayerSessions } from "./models/playerSessions.ts";

export const validatePlayerSession = async (context: Context, next: Next) => {
  const playerSessionId = getCookie(context, "playerSessionId");
  if (!playerSessionId) return context.redirect("/login.html");

  const playerSessions: PlayerSessions = context.get("playerSessions");
  const playerName = playerSessions.getPlayer(playerSessionId);
  if (!playerName) return context.redirect("/login.html");

  context.set("playerName", playerName);
  context.set("playerSessionId", playerSessionId);
  return await next();
};

export const checkUserLogin = async (context: Context, next: Next) => {
  const playerSessionId = getCookie(context, "playerSessionId");

  const playerSessions: PlayerSessions = context.get("playerSessions");
  const playerName = playerSessions.getPlayer(playerSessionId || "");

  if (playerName) return context.redirect("/");

  return await next();
};

export const addPlayerToGame = async (context: Context, next: Next) => {
  setCookie(context, "playerGameId", "0");
  return await next();
};

export const validateGamePlayer = async (context: Context, next: Next) => {
  const gameId = getCookie(context, "gameId");
  if (!gameId) return context.redirect("/");
  context.set("gameId", gameId);

  return await next();
};

export const validateJoin = async (ctx: Context, next: Next) => {
  const roomId = getCookie(ctx, "roomId");

  if (!roomId) return await next();
  return ctx.redirect("/waiting.html");
};
