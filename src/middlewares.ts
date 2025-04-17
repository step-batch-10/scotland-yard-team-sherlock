import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { PlayerSessions } from "./models/playerSessions.ts";

export const validatePlayerSession = async (context: Context, next: Next) => {
  const playerSessionId = getCookie(context, "playerSessionId");
  if (!playerSessionId) return context.redirect("/login.html");

  const playerSessions: PlayerSessions = context.get("playerSessions");
  const playerName = playerSessions.getPlayer(Number(playerSessionId));
  if (!playerName) return context.redirect("/login.html");

  context.set("playerName", playerName);
  context.set("playerSessionId", playerSessionId);

  return await next();
};

export const checkUserLogin = async (context: Context, next: Next) => {
  const playerSessionId = getCookie(context, "playerSessionId");

  const playerSessions: PlayerSessions = context.get("playerSessions");
  const playerName = playerSessions.getPlayer(Number(playerSessionId));

  if (playerName) return context.redirect("/");

  return await next();
};
