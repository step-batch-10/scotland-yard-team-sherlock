import { createApp } from "./src/app.ts";
import { Lobby } from "./src/models/lobby.ts";
import { PlayerSessions } from "./src/models/playerSessions.ts";

const main = () => {
  const playerSessions = new PlayerSessions();
  const lobby = new Lobby();

  const app = createApp(playerSessions, lobby);

  Deno.serve({ port: 8000 }, app.fetch);
};

main();
