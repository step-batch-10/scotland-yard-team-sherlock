import { assert, assertEquals } from "assert";
import { GameManager } from "../src/models/gameManager.ts";
import { describe, test } from "jsr:@std/testing/bdd";

describe("Game Manager", () => {
  const gameManager = new GameManager();

  test("Should create Game and return gameId", () => {
    const players = ["1", "2", "3", "4", "5", "6"];
    const gameId = gameManager.createGame("1", players);

    assertEquals(gameId, "1");
  });

  test("Should return game", () => {
    const players = ["1", "2", "3", "4", "5", "6"];
    const gameId = gameManager.createGame("1", players);
    const game = gameManager.getGame(gameId);

    assertEquals(game!.getPlayers(), players);
  });

  test("Should return true ", () => {
    assert(gameManager.hasGame("1"));
  });

  test("Should return true by game deletion", () => {
    assert(gameManager.deleteGame("1"));
  });
});
