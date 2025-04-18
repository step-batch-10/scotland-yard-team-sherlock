import { createApp } from "./src/app.ts";
import { GameManager } from "./src/models/gameManager.ts";
import { Game } from "./src/models/game.ts";
import { Lobby, LobbyManager } from "./src/models/lobby.ts";
import { PlayerSessions } from "./src/models/playerSessions.ts";

const main = () => {
  const playerSessions = new PlayerSessions();
  const lobby = new Lobby();
  const lobbyManager = new LobbyManager();
  const gameManager = new GameManager();
  const game = new Game([
    { id: "0", position: 1, color: "red" },
    { id: "1", position: 2, color: "aqua" },
    { id: "2", position: 3, color: "purple" },
  ]);

  const app = createApp(playerSessions, lobby, lobbyManager, gameManager, game);

  Deno.serve({ port: 8000 }, app.fetch);
};

main();
