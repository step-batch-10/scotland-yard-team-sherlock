import { assert, assertEquals } from "assert";
import { GameManager, Players } from "../../src/models/gameManager.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import { User } from "../../src/models/lobby.ts";

describe("Game Manager", () => {
  const gameManager = new GameManager();
  const players: User[] = [
    { name: "a", id: "1" },
    { name: "b", id: "2" },
    { name: "c", id: "3" },
    { name: "d", id: "4" },
    { name: "e", id: "5" },
    { name: "f", id: "6" },
  ];

  it("Should create Game and return gameId", () => {
    const gameId = gameManager.saveGame({ gameId: "1", players });

    assertEquals(gameId, "1");
  });

  it("Should return game", () => {
    const gameId = gameManager.saveGame({ gameId: "1", players });
    const game = gameManager.getGame(gameId);

    const mrxInventory = {
      tickets: { bus: 3, taxi: 2, underground: 2, black: 6 },
      cards: { doubleMove: 2 },
    };
    const detectiveInventory = {
      tickets: { bus: 8, taxi: 10, underground: 4 },
    };

    const expected = [
      {
        name: "a",
        id: "1",
        color: "black",
        position: 1,
        isMrx: true,
        inventory: mrxInventory,
      },
      {
        name: "b",
        id: "2",
        color: "yellow",
        position: 2,
        isMrx: false,
        inventory: detectiveInventory,
      },
      {
        name: "c",
        id: "3",
        color: "green",
        position: 3,
        isMrx: false,
        inventory: detectiveInventory,
      },
      {
        name: "d",
        id: "4",
        color: "red",
        position: 4,
        isMrx: false,
        inventory: detectiveInventory,
      },
      {
        name: "e",
        id: "5",
        color: "blue",
        position: 5,
        isMrx: false,
        inventory: detectiveInventory,
      },
      {
        name: "f",
        id: "6",
        color: "violet",
        position: 6,
        isMrx: false,
        inventory: detectiveInventory,
      },
    ];
    assertEquals(game!.getPlayers(), expected as Players);
  });

  it("Should return true ", () => {
    assert(gameManager.hasGame("1"));
  });

  it("Should return true by game deletion", () => {
    assert(gameManager.deleteGame("1"));
  });
});
