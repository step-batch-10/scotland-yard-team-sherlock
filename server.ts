import { createApp } from "./src/app.ts";
import { PlayerSessions } from "./src/models/playerSessions.ts";

const main = () => {
  const playerSessions = new PlayerSessions();

  const app = createApp(playerSessions);

  Deno.serve({ port: 8000 }, app.fetch);
};

main();
