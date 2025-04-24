import { assertEquals } from "assert/equals";
import { describe, it } from "testing/bdd";
import { Game } from "../../src/models/game.ts";
import { Players } from "../../src/models/gameManager.ts";

export const mrxInventory = () => {
  return {
    tickets: { bus: 3, taxi: 4, underground: 3, black: 5 },
    cards: { doubleMove: 2 },
  };
};

export const detectiveInventory = () => {
  return {
    tickets: { bus: 8, taxi: 10, underground: 4 },
  };
};

export const getPlayers = (): Players => {
  return [
    {
      name: "a",
      id: "1",
      color: "black",
      position: 1,
      isMrx: true,
      inventory: mrxInventory(),
    },
    {
      name: "b",
      id: "2",
      color: "#63a4ff",
      position: 2,
      isMrx: false,
      inventory: detectiveInventory(),
    },
    {
      name: "c",
      id: "3",
      color: "#ffb347",
      position: 3,
      isMrx: false,
      inventory: detectiveInventory(),
    },
    {
      name: "d",
      id: "4",
      color: "red",
      position: 4,
      isMrx: false,
      inventory: detectiveInventory(),
    },
    {
      name: "e",
      id: "5",
      color: "blue",
      position: 5,
      isMrx: false,
      inventory: detectiveInventory(),
    },
    {
      name: "f",
      id: "6",
      color: "violet",
      position: 6,
      isMrx: false,
      inventory: detectiveInventory(),
    },
  ];
};

describe("Game class", () => {
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
