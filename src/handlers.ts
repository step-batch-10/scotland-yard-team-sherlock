import { Context } from "hono";
import { PlayerManager } from "./models/playerManager.ts";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { LobbyManager } from "./models/lobbyManager.ts";
import { GameManager } from "./models/gameManager.ts";
import { Room } from "./models/room.ts";
import { Game } from "./models/game.ts";
import { Players } from "./models/gameManager.ts";

export const handleLeaveLobby = (context: Context) => {
  const playerId = context.get("playerId");
  const room: Room = context.get("room");

  room.remove(playerId);

  deleteCookie(context, "roomId");
  return context.text("/");
};

export const serveGameInitialDetails = (context: Context) => {
  const game: Game = context.get("game");
  const players: Players = game.players;

  return context.json(players);
};

export const serveRoomStatus = (context: Context) => {
  const room: Room = context.get("room");
  const players = room.players.map(({ name }) => name);

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

export const handleRoomJoin = (context: Context) => {
  const roomId = context.get("roomId");
  const id = context.get("playerId");
  const name = context.get("playerName");

  const lobbyManager: LobbyManager = context.get("lobbyManager");
  const { room } = lobbyManager.addToRoom(roomId, { name, id });

  if (room.isFull) {
    const gameManager: GameManager = context.get("gameManager");
    gameManager.createGame(roomId, room.players);
    lobbyManager.deleteRoom(roomId);
  }

  setCookie(context, "roomId", roomId);
  context.status(302);
  return context.json({ location: "/waiting.html" });
};

export const handleQuickJoin = (context: Context) => {
  const id = context.get("playerId");
  const name = context.get("playerName");

  const lobbyManager: LobbyManager = context.get("lobbyManager");
  const { room, roomId } = lobbyManager.assignRoom({ name, id });

  if (room.isFull) {
    const gameManager: GameManager = context.get("gameManager");
    gameManager.createGame(roomId, room.players);
    lobbyManager.deleteRoom(roomId);
  }

  setCookie(context, "roomId", roomId);
  context.status(302);
  return context.redirect("/waiting.html");
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
  const moveData = await context.req.json();

  const { status, message } = game!.move(playerId!, moveData);

  context.status(status ? 200 : 403);
  return context.json({ message });
};

export const handleHostGame = (context: Context) => {
  const playerId = context.get("playerId");
  const lobbyManager: LobbyManager = context.get("lobbyManager");
  const playerName = context.get("playerName");
  const { roomId } = lobbyManager.hostRoom({ id: playerId, name: playerName });

  setCookie(context, "roomId", roomId);

  return context.redirect("/waiting.html");
};

export const handleQuitGame = (context: Context) => {
  const playerId = context.get("playerId");
  const gameManager: GameManager = context.get("gameManager");

  gameManager.removePlayerGameId(playerId);
  deleteCookie(context, "gameId");

  return context.redirect("/");
};
