import { Context } from "hono";
import { PlayerSessions } from "./models/playerSessions.ts";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { LobbyManager } from "./models/lobby.ts";
import { GameManager } from "./models/gameManager.ts";

export const leaveLobby = (ctx: Context) => {
  const playerId = getCookie(ctx, "playerId");
  const roomId = deleteCookie(ctx, "roomId");
  const lobbyManager: LobbyManager = ctx.get("lobbyManager");
  lobbyManager.removePlayer(roomId!, playerId!);

  return ctx.text("/");
};

export const assignRoles = (ctx: Context) => {
  const gameId = getCookie(ctx, "gameId");
  const gameManager: GameManager = ctx.get("gameManager");
  const players: Player[] = gameManager.getGameDetails(gameId!);

  return ctx.json(players);
};

const playerName = (ctx: Context, id: string) => {
  const playerSessions: PlayerSessions = ctx.get("playerSessions");
  return playerSessions.getPlayer(id);
};

export const serveRoomStatus = (context: Context) => {
  const roomId = context.get("roomId");
  const lobbyManager: LobbyManager = context.get("lobbyManager");

  const playerIds = lobbyManager.getRoomPlayers(roomId);

  const players = playerIds.map(({ id }) => playerName(context, id));
  return context.json({ players, isLobbyFull: false });
};

export const serveIndex = async (context: Context) => {
  const page = await Deno.readTextFile("./public/index.html");

  const playerName = context.get("playerName");

  return context.html(page.replaceAll("##NAME##", playerName));
};

export const serveWaitingPage = async (context: Context) => {
  const page = await Deno.readTextFile("./public/waiting.html");

  const roomId = context.get("roomId");

  return context.html(page.replaceAll("##ROOM-ID##", `Room ID - ${roomId}`));
};

export const login = async (context: Context) => {
  const formData = await context.req.formData();
  const playerName = formData.get("player-name") as string;

  const playerSessions: PlayerSessions = context.get("playerSessions");
  const playerId = playerSessions.createSession(playerName);

  setCookie(context, "playerId", playerId);
  return context.redirect("/");
};

export interface Player {
  name: string;
  id: string;
  color: string;
  position: number;
}
export const joinUser = (ctx: Context) => {
  const roomId = ctx.get("roomId");
  const playerId = ctx.get("playerId");
  const name = ctx.get("playerName");
  const lobbyManager: LobbyManager = ctx.get("lobbyManager");
  const gameManager: GameManager = ctx.get("gameManager");
  const { isLobbyFull } = lobbyManager.addToExistingRoom(roomId, {
    id: playerId,
    name,
  });

  if (isLobbyFull) {
    gameManager.saveGame(lobbyManager.createGame(roomId));
  }

  ctx.status(302);
  return ctx.json({ location: "/waiting.html" });
};

export const handleGameJoin = (ctx: Context) => {
  const playerId = ctx.get("playerId");
  const lobbyManager: LobbyManager = ctx.get("lobbyManager");
  const gameManager: GameManager = ctx.get("gameManager");
  const name: string = ctx.get("playerName");
  const { roomId, isLobbyFull }: { roomId: string; isLobbyFull: boolean } =
    lobbyManager.addPlayer({ id: playerId!, name });

  if (isLobbyFull) {
    gameManager.saveGame(lobbyManager.createGame(roomId));
  }

  setCookie(ctx, "roomId", roomId);
  return ctx.redirect("/waiting.html");
};

export const logout = (context: Context) => {
  const playerId = context.get("playerId");
  const playerSessions: PlayerSessions = context.get("playerSessions");
  playerSessions.delete(playerId);

  deleteCookie(context, "playerId");
  return context.redirect("/login.html");
};

export const serveGameStatus = (context: Context) => {
  const gameManager: GameManager = context.get("gameManager");
  const gameId: string = context.get("gameId");
  const playerId: string = context.get("playerId");

  const game = gameManager.getGame(gameId);

  const status = game!.gameStatus(playerId);
  return context.json(status);
};

export const makeMove = async (context: Context) => {
  const gameManager: GameManager = context.get("gameManager");
  const playerId = getCookie(context, "playerId");
  const gameId: string = context.get("gameId");
  const game = gameManager.getGame(gameId);
  const { stationNumber } = await context.req.json();

  const { status, message } = game!.move(playerId!, stationNumber);

  context.status(status ? 200 : 403);
  return context.json({ message });
};
