import { assert, assertEquals } from "assert";
import { GameManager } from "../../src/models/gameManager.ts";
import { describe, test as it } from "jsr:@std/testing/bdd";
import { Player } from "../../src/handlers.ts";

describe("Game Manager", () => {
  const gameManager = new GameManager();
  const players: Player[] = [
    { name: "a", id: "1", color: "red", position: 1 },
    { name: "b", id: "2", color: "red", position: 1 },
    { name: "c", id: "3", color: "red", position: 1 },
    { name: "d", id: "4", color: "red", position: 1 },
    { name: "e", id: "5", color: "red", position: 1 },
    { name: "f", id: "6", color: "red", position: 1 },
  ];

  it("Should create Game and return gameId", () => {
    const gameId = gameManager.createGame("1", players);

    assertEquals(gameId, "1");
  });

  it("Should return game", () => {
    const gameId = gameManager.createGame("1", players);
    const game = gameManager.getGame(gameId);

    assertEquals(game!.getPlayers(), players);
  });

  it("Should return true ", () => {
    assert(gameManager.hasGame("1"));
  });

  it("Should return true by game deletion", () => {
    assert(gameManager.deleteGame("1"));
  });
});
