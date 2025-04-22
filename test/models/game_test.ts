import { assertEquals } from "assert/equals";
import { describe, it } from "testing/bdd";
import { Game } from "../../src/models/game.ts";
import { Players } from "../../src/models/gameManager.ts";

export const getPlayers = (): Players => {
  const mrxInventory = {
    tickets: { bus: 3, taxi: 2, underground: 2, black: 6 },
    cards: { doubleMove: 2 },
  };
  const detectiveInventory = {
    tickets: { bus: 8, taxi: 10, underground: 4 },
  };
  return [
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
};

describe("Game class", () => {
  it("should return game status", () => {
    const players = getPlayers();
    const game: Game = new Game(players);
    const expectedStatus = {
      isYourTurn: true,
      playerPositions: [
        { isCurrentPlayer: true, color: "black", position: 1, name: "a" },
        { isCurrentPlayer: false, color: "yellow", position: 2, name: "b" },
        { isCurrentPlayer: false, color: "green", position: 3, name: "c" },
        { isCurrentPlayer: false, color: "red", position: 4, name: "d" },
        { isCurrentPlayer: false, color: "blue", position: 5, name: "e" },
        { isCurrentPlayer: false, color: "violet", position: 6, name: "f" },
      ],
    };

    assertEquals(game.gameStatus("1"), expectedStatus);
  });

  it("Should return move player position", () => {
    const players = getPlayers();
    const game: Game = new Game(players);
    const result = game.move("1", 7);
    const expected = { status: true, message: "Moved to 7" };

    assertEquals(result, expected);
  });

  it("Should say not your move", () => {
    const players = getPlayers();
    const game: Game = new Game(players);
    const result = game.move("2", 7);
    const expected = { status: false, message: "Not Your Move ..!" };

    assertEquals(result, expected);
  });

  it("Should Invalid move since it is occupied", () => {
    const players = getPlayers();
    const game: Game = new Game(players);
    const result = game.move("1", 2);
    const expected = { status: false, message: "Station already occupied ..!" };

    assertEquals(result, expected);
  });
});
