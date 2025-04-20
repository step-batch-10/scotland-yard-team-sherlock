import { Context } from "hono";
import { PlayerSessions } from "./models/playerSessions.ts";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { LobbyManager } from "./models/lobby.ts";
import { GameManager } from "./models/gameManager.ts";

export const leaveLobby = (ctx: Context) => {
  const sessionId = getCookie(ctx, "playerSessionId");
  const roomId = deleteCookie(ctx, "roomId");
  const lobbyManager: LobbyManager = ctx.get("lobbyManager");
  lobbyManager.removePlayer(roomId!, sessionId!);

  return ctx.text("/");
};

export const assignRoles = (ctx: Context) => {
  const gameId = getCookie(ctx, "gameId");
  const gameManager: GameManager = ctx.get("gameManager");
  const players: Player[] = gameManager.getGameDetails(gameId!);

  const playersWithRoles = players.map((pl) => {
    return { ...pl, role: "Detective" };
  });

  return ctx.json(playersWithRoles);
};

const playerName = (ctx: Context, id: string) => {
  const playerSessions: PlayerSessions = ctx.get("playerSessions");
  return playerSessions.getPlayer(id);
};

export const fetchPlayers = (ctx: Context) => {
  const { playerSessionId, roomId } = getCookie(ctx);
  const lobbyManager: LobbyManager = ctx.get("lobbyManager");
  const gameId = lobbyManager.getGameId(playerSessionId!);

  if (!gameId) {
    const playerIds = lobbyManager.getRoomPlayers(roomId);

    const players = playerIds.map((id) => playerName(ctx, id));
    return ctx.json({ players, isLobbyFull: false });
  }

  deleteCookie(ctx, "roomId");
  setCookie(ctx, "gameId", gameId!);
  return ctx.json({ isLobbyFull: true });
};

export const serveIndex = async (context: Context) => {
  const page = await Deno.readTextFile("./public/index.html");

  const playerName = context.get("playerName");

  return context.html(page.replaceAll("##NAME##", playerName));
};

export const login = async (context: Context) => {
  const formData = await context.req.formData();
  const playerName = formData.get("player-name") as string;

  const playerSessions: PlayerSessions = context.get("playerSessions");
  const playerSessionId = playerSessions.createSession(playerName);

  setCookie(context, "playerSessionId", playerSessionId);
  return context.redirect("/");
};

const assign = (players: string[], ctx: Context): Player[] => {
  const colors = ["yellow", "green", "red", "blue", "violet", "black"];
  const playerSessions: PlayerSessions = ctx.get("playerSessions");

  return players.map((playerId, index) => {
    const color = colors[index];
    const name: string = playerSessions.getPlayer(playerId) || "";
    return { name, id: playerId, color, position: index + 1 };
  });
};

export interface Player {
  name: string;
  id: string;
  color: string;
  position: number;
}

export const handleGameJoin = (ctx: Context) => {
  const sessionId = getCookie(ctx, "playerSessionId");
  const lobbyManager: LobbyManager = ctx.get("lobbyManager");
  const gameManager: GameManager = ctx.get("gameManager");

  const roomId: string = lobbyManager.addPlayer(sessionId!);
  const isLobbyFull = lobbyManager.isRoomFull(roomId);

  if (isLobbyFull) {
    const players = lobbyManager.getRoomPlayers(roomId);
    const gameId = lobbyManager.movePlayersToGame(roomId);
    gameManager.createGame(gameId, assign(players, ctx));
  }

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
  const gameManager: GameManager = context.get("gameManager");
  const gameId: string = context.get("gameId");
  const game = gameManager.getGame(gameId);

  const status = game!.gameStatus(gameId);
  return context.json(status);
};

export const makeMove = async (context: Context) => {
  const gameManager: GameManager = context.get("gameManager");
  const sessionId = getCookie(context, "playerSessionId");
  const gameId: string = context.get("gameId");
  const game = gameManager.getGame(gameId);
  const { stationNumber } = await context.req.json();

  const { status, message } = game!.move(sessionId!, stationNumber);

  context.status(status ? 200 : 403);
  return context.json({ message });
};
