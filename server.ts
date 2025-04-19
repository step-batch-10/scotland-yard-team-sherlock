import { createApp } from "./src/app.ts";
import { GameManager } from "./src/models/gameManager.ts";
import { Game } from "./src/models/game.ts";
import { LobbyManager } from "./src/models/lobby.ts";
import { PlayerSessions } from "./src/models/playerSessions.ts";

const main = () => {
  const playerSessions = new PlayerSessions();
  const lobbyManager = new LobbyManager();
  const gameManager = new GameManager();
  const game = new Game([
    { id: "0", position: 1, color: "red", name: "Asma" },
    { id: "1", position: 2, color: "aqua", name: "Deepanshu" },
    { id: "2", position: 3, color: "purple", name: "Favas" },
  ]);

  const app = createApp(playerSessions, lobbyManager, gameManager, game);

  Deno.serve({ port: 8000 }, app.fetch);
};

main();
