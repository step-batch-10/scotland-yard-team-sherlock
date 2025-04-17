import { Context } from "hono";
import { PlayerSessions } from "./models/playerSessions.ts";
import { setCookie } from "hono/cookie";
import { serveStatic } from "hono/deno";
import { Lobby } from "./models/lobby.ts";

type info = { name: string; role: string; color: string };

const addPlayerInfo = (
  playersInfo: info[],
  name: string,
  role: string,
  color: string,
) => playersInfo.push({ name, role, color });

export const assignRoles = (context: Context) => {
  const players = ["A", "B", "C", "D", "E", "F"];
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

  return context.json(playersInfo);
};

export const fetchPlayers = (context: Context) => {
  const players = ["A", "B", "C", "D", "E", "F"];
  const isLobbyFull = true;
  return context.json({ players, isLobbyFull });
};

const generateId = (): string => {
  const time = Date.now();
  return (time + Math.floor(Math.random() * 1000)).toString();
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

  const playerSessionId = generateId();

  const playerSessions: PlayerSessions = context.get("playerSessions");
  playerSessions.add(playerSessionId, playerName);

  setCookie(context, "playerSessionId", playerSessionId);
  return context.redirect("/");
};

export const handleGameJoin = async (ctx: Context) => {
  const formData: FormData = await ctx.req.formData();
  const name = formData.get("name");

  const lobby = ctx.get("lobby");
  lobby.add(name);

  return ctx.redirect("/waiting.html");
};

export const handleWaitingReq = (ctx: Context) => {
  const lobby: Lobby = ctx.get("lobby");
  const waitingPlayers: string[] = lobby.players;
  const isLobbyFull: boolean = lobby.isLobbyFull();

  return ctx.json({ waitingPlayers, isLobbyFull });
};
