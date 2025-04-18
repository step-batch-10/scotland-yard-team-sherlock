import { createApp } from "./src/app.ts";
import { GameManager } from "./src/models/gameManager.ts";
import { Lobby, LobbyManager } from "./src/models/lobby.ts";
import { PlayerSessions } from "./src/models/playerSessions.ts";

const main = () => {
  const playerSessions = new PlayerSessions();
  const lobby = new Lobby();
  const lobbyManager = new LobbyManager();
  const gameManager = new GameManager();
  const app = createApp(playerSessions, lobby, lobbyManager, gameManager);

  Deno.serve({ port: 8000 }, app.fetch);
};

main();
