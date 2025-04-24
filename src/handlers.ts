import { Context } from "hono";
import { PlayerManager } from "./models/playerManager.ts";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { LobbyManager } from "./models/lobby.ts";
import { GameManager } from "./models/gameManager.ts";

export const handleLeaveLobby = (ctx: Context) => {
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
  const playerManager: PlayerManager = ctx.get("playerManager");
  return playerManager.get(id);
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

  return context.html(page.replaceAll("###", `${roomId}`));
};

export const handleLogin = async (context: Context) => {
  const formData = await context.req.formData();
  const playerName = formData.get("player-name") as string;

  const playerManager: PlayerManager = context.get("playerManager");
  const playerId = playerManager.add(playerName);

  setCookie(context, "playerId", playerId);
  return context.redirect("/");
};

export interface Player {
  name: string;
  id: string;
  color: string;
  position: number;
}
export const handleRoomJoin = (context: Context) => {
  const roomId = context.get("roomId");
  const playerId = context.get("playerId");
  const name = context.get("playerName");

  const lobbyManager: LobbyManager = context.get("lobbyManager");

  const gameManager: GameManager = context.get("gameManager");
  const { isLobbyFull } = lobbyManager.addToExistingRoom(roomId, {
    id: playerId,
    name,
  });

  if (isLobbyFull) {
    gameManager.saveGame(lobbyManager.createGame(roomId));
  }

  context.status(302);
  return context.json({ location: "/waiting.html" });
};

export const handleQuickJoin = (ctx: Context) => {
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

export const handleLogout = (context: Context) => {
  const playerId = context.get("playerId");
  const playerManager: PlayerManager = context.get("playerManager");
  playerManager.delete(playerId);

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

export const handleMove = async (context: Context) => {
  const gameManager: GameManager = context.get("gameManager");
  const playerId = getCookie(context, "playerId");
  const gameId: string = context.get("gameId");
  const game = gameManager.getGame(gameId);
  const { stationNumber } = await context.req.json();

  const { status, message } = game!.move(playerId!, stationNumber);

  context.status(status ? 200 : 403);
  return context.json({ message });
};
