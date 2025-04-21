import { assertEquals } from "assert/equals";
import { describe, it } from "testing/bdd";
import { Game, Player } from "../src/models/game.ts";

const getPlayers = () => [
  { name: "a", id: "1", color: "red", position: 1 },
  { name: "b", id: "2", color: "red", position: 2 },
  { name: "c", id: "3", color: "red", position: 3 },
  { name: "d", id: "4", color: "red", position: 4 },
  { name: "e", id: "5", color: "red", position: 5 },
  { name: "f", id: "6", color: "red", position: 6 },
];

describe("Game class", () => {
  it("should return game status", () => {
    const players: Player[] = [
      { name: "a", id: "1", color: "red", position: 1 },
      { name: "b", id: "2", color: "red", position: 1 },
      { name: "c", id: "3", color: "red", position: 1 },
      { name: "d", id: "4", color: "red", position: 1 },
      { name: "e", id: "5", color: "red", position: 1 },
      { name: "f", id: "6", color: "red", position: 1 },
    ];
    const game: Game = new Game(players);
    const expectedStatus = {
      isYourTurn: true,
      playerPositions: [
        { isCurrentPlayer: true, color: "red", position: 1, name: "a" },
        { isCurrentPlayer: false, color: "red", position: 1, name: "b" },
        { isCurrentPlayer: false, color: "red", position: 1, name: "c" },
        { isCurrentPlayer: false, color: "red", position: 1, name: "d" },
        { isCurrentPlayer: false, color: "red", position: 1, name: "e" },
        { isCurrentPlayer: false, color: "red", position: 1, name: "f" },
      ],
    };

    assertEquals(game.gameStatus("1"), expectedStatus);
  });

  it("Should return move player position", () => {
    const players: Player[] = getPlayers();
    const game: Game = new Game(players);
    const result = game.move("1", 7);
    const expected = { status: true, message: "Moved to 7" };

    assertEquals(result, expected);
  });

  it("Should say not your move", () => {
    const players: Player[] = getPlayers();
    const game: Game = new Game(players);
    const result = game.move("2", 7);
    const expected = { status: false, message: "Not Your Move ..!" };

    assertEquals(result, expected);
  });

  it("Should Invalid move since it is occupied", () => {
    const players: Player[] = getPlayers();
    const game: Game = new Game(players);
    const result = game.move("1", 2);
    const expected = { status: false, message: "Station already occupied ..!" };

    assertEquals(result, expected);
  });
});
