import { createApp } from "./src/app.ts";
import { GameManager } from "./src/models/gameManager.ts";
import { LobbyManager } from "./src/models/lobby.ts";
import { PlayerManager } from "./src/models/playerManager.ts";

const main = () => {
  const playerManager = new PlayerManager();
  const lobbyManager = new LobbyManager();
  const gameManager = new GameManager();

  const app = createApp(playerManager, lobbyManager, gameManager);

  Deno.serve({ port: 8000 }, app.fetch);
};

main();
