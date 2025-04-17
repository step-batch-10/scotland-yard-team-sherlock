import { Context } from "hono";
import { PlayerSessions } from "./models/playerSessions.ts";
import { getCookie, setCookie } from "hono/cookie";
import { serveStatic } from "hono/deno";
import { Lobby } from "./models/lobby.ts";

type info = { name: string; role: string; color: string };

const addPlayerInfo = (
  playersInfo: info[],
  name: string,
  role: string,
  color: string,
) => playersInfo.push({ name, role, color });

export const assignRoles = (ctx: Context) => {
  const lobby: Lobby = ctx.get("lobby");
  const players: string[] = lobby.players;
  const colors = ["yellow", "green", "red", "blue", "violet"];
  const mrXIndex = 2;
  const playersInfo: info[] = [];
  let colorIndex = 0;

  players.forEach((player, index) => {
    const color = colors[colorIndex];
    if (index === mrXIndex) {
      addPlayerInfo(playersInfo, player, "Mr X", "black");
      return;
    }
    addPlayerInfo(playersInfo, player, "Detective", color);
    colorIndex++;
  });

  return ctx.json(playersInfo);
};

export const fetchPlayers = (ctx: Context) => {
  const lobby: Lobby = ctx.get("lobby");
  const players: string[] = lobby.players;
  const isLobbyFull: boolean = lobby.isLobbyFull();

  return ctx.json({ players, isLobbyFull });
};

export const serveIndex = async (context: Context) => {
  const page = await Deno.readTextFile("./public/index.html");

  const playerName = context.get("playerName");

  return context.html(page.replaceAll("##NAME##", playerName));
};

export const serveLoginPage = serveStatic({ path: "./public/login.html" });

export const login = async (context: Context) => {
  const formData = await context.req.formData();
  const playerName = formData.get("player-name") as string;

  const playerSessions: PlayerSessions = context.get("playerSessions");
  const playerSessionId = playerSessions.createSession(playerName);

  setCookie(context, "playerSessionId", playerSessionId);
  return context.redirect("/");
};

export const handleGameJoin = (ctx: Context) => {
  const sessionId = getCookie(ctx, "playerSessionId");

  const playerSessions: PlayerSessions = ctx.get("playerSessions");
  const name = playerSessions.getPlayer(sessionId || "");
  const lobby = ctx.get("lobby");
  lobby.add(name);

  return ctx.redirect("/waiting.html");
};

export const handlePlayerPositions = (context: Context) => {
  return context.json([
    { position: 6, color: "red" },
    { position: 12, color: "blue" },
    { position: 15, color: "yellow" },
    { position: 24, color: "green" },
    { position: 30, color: "white" },
    { position: 27, color: "purple" },
  ]);
};
