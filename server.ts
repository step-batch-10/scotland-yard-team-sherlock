import { createApp } from "./src/app.ts";
import { GameManager } from "./src/models/gameManager.ts";
import { LobbyManager } from "./src/models/lobbyManager.ts";
import { getIdGenerator, PlayerManager } from "./src/models/playerManager.ts";
import * as _ from "lodash";

const main = () => {
  const startingPositions = [
    13,
    26,
    29,
    34,
    50,
    53,
    91,
    94,
    103,
    112,
    117,
    132,
    138,
    141,
    155,
    174,
    197,
    198,
  ];
  const playerManager = new PlayerManager(getIdGenerator());
  const lobbyManager = new LobbyManager(getIdGenerator());
  const gameManager = new GameManager(_.shuffle, startingPositions);

  const app = createApp(playerManager, lobbyManager, gameManager);

  Deno.serve({ port: 8000 }, app.fetch);
};

main();
