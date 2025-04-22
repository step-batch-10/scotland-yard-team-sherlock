import { assert, assertEquals } from "assert";
import { GameManager } from "../../src/models/gameManager.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import { User } from "../../src/models/lobby.ts";

describe("Game Manager", () => {
  const gameManager = new GameManager();
  const players: User[] = [
    { name: "a", id: "1" },
    { name: "b", id: "2" },
    { name: "c", id: "3" },
  ];

  it("Should create Game and return gameId", () => {
    const gameId = gameManager.saveGame({ gameId: "1", players });

    assertEquals(gameId, "1");
  });

  it("Should return game", () => {
    const gameId = gameManager.saveGame({ gameId: "1", players });
    const game = gameManager.getGame(gameId);

    const expected = [
      { name: "a", id: "1", color: "yellow", position: 1, role: "Mr.X" },
      { name: "b", id: "2", color: "green", position: 2, role: "Detective" },
      { name: "c", id: "3", color: "red", position: 3, role: "Detective" },
    ];
    assertEquals(game!.getPlayers(), expected);
  });

  it("Should return true ", () => {
    assert(gameManager.hasGame("1"));
  });

  it("Should return true by game deletion", () => {
    assert(gameManager.deleteGame("1"));
  });
});
