import { Context } from "hono";
import { PlayerSessions } from "./models/playerSessions.ts";
import { setCookie } from "hono/cookie";

const generateId = (): string => {
  const time = Date.now();
  return (time + Math.floor(Math.random() * 1000)).toString();
};

export const serveIndex = async (context: Context) => {
  const page = await Deno.readTextFile("./public/index.html");

  const playerName = context.get("playerName");

  return context.html(page.replaceAll("##NAME##", playerName));
};

export const login = async (context: Context) => {
  const formData = await context.req.formData();
  const playerName = formData.get("player-name") as string;

  const playerSessionId = generateId();

  const playerSessions: PlayerSessions = context.get("playerSessions");
  playerSessions.add(playerSessionId, playerName);

  setCookie(context, "playerSessionId", playerSessionId);
  return context.redirect("/");
};

export const handleGameJoin = (ctx: Context) => {
  return ctx.redirect("/waiting.html");
};
