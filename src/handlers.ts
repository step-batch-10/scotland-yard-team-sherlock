import { Context } from "hono";
import { PlayerSessions } from "./models/playerSessions.ts";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { serveStatic } from "hono/deno";
import { Lobby, LobbyManager } from "./models/lobby.ts";
// import { GameManager } from "./models/gameManager.ts";
import { Game } from "./models/game.ts";

type info = { name: string; role: string; color: string };

export const leaveLobby = (ctx: Context) => {
  const sessionId = getCookie(ctx, "playerSessionId");
  const lobby: Lobby = ctx.get("lobby");
  lobby.removePlayer(sessionId!);
  return ctx.text("/");
};

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
export const serveGamePage = serveStatic({ path: "./public/game.html" });

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
  const lobbyManager: LobbyManager = ctx.get("lobbyManager");
  // const gameManager: GameManager = ctx.get("gameManager");

  const name = playerSessions.getPlayer(sessionId || "");
  const lobby = ctx.get("lobby");
  lobby.addPlayer(sessionId, name);

  const roomId: string = lobbyManager.addPlayer(sessionId!);
  // const isLobbyFull = lobbyManager.isRoomFull(roomId);

  // if (isLobbyFull) {
  //   const players = lobbyManager.getRoomPlayers(roomId);
  //   const gameId = lobbyManager.movePlayersToGame(roomId);
  //   gameManager.createGame(gameId, players);
  // }

  setCookie(ctx, "roomId", roomId);
  return ctx.redirect("/waiting.html");
};

export const logout = (context: Context) => {
  const playerSessionId = context.get("playerSessionId");
  const playerSessions: PlayerSessions = context.get("playerSessions");
  playerSessions.delete(playerSessionId);

  deleteCookie(context, "playerSessionId");
  return context.redirect("/login.html");
};

export const serveGameStatus = (context: Context) => {
  const game: Game = context.get("game");
  const playerGameId: string = context.get("playerGameId");
  const status = game.gameStatus(playerGameId);
  return context.json(status);
};

export const makeMove = async (context: Context) => {
  const game: Game = context.get("game");
  const playerGameId: string = context.get("playerGameId");

  const { stationNumber } = await context.req.json();

  const { status, message } = game.move(playerGameId, stationNumber);

  context.status(status ? 200 : 403);
  return context.json({ message });
};
