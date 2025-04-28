import { assert, assertEquals, assertFalse } from "assert";
import { GameManager, Players } from "../../src/models/gameManager.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import { Game } from "../../src/models/game.ts";

describe("Game Manager", () => {
  const players = [
    { name: "a", id: "1" },
    { name: "b", id: "2" },
    { name: "c", id: "3" },
    { name: "d", id: "4" },
    { name: "e", id: "5" },
    { name: "f", id: "6" },
  ];

  const inventory = {
    mrx: {
      tickets: { bus: 3, taxi: 4, underground: 3, black: 5 },
      cards: { doubleMove: 2 },
    },
    detective: { tickets: { bus: 8, taxi: 10, underground: 4 } },
  };

  const playerDetails = [
    {
      name: "a",
      id: "1",
      color: "black",
      position: 1,
      isMrx: true,
      inventory: inventory.mrx,
    },
    {
      name: "b",
      id: "2",
      color: "#63a4ff",
      position: 2,
      isMrx: false,
      inventory: inventory.detective,
    },
    {
      name: "c",
      id: "3",
      color: "#ffb347",
      position: 3,
      isMrx: false,
      inventory: inventory.detective,
    },
    {
      name: "d",
      id: "4",
      color: "red",
      position: 4,
      isMrx: false,
      inventory: inventory.detective,
    },
    {
      name: "e",
      id: "5",
      color: "blue",
      position: 5,
      isMrx: false,
      inventory: inventory.detective,
    },
    {
      name: "f",
      id: "6",
      color: "violet",
      position: 6,
      isMrx: false,
      inventory: inventory.detective,
    },
  ];

  it("should not return game id if no game id present for a player", () => {
    const gameManager = new GameManager();
    assertFalse(gameManager.getGameId("111"));
  });

  it("should return the game id if player has assigned to a game", () => {
    const gameManager = new GameManager(new Map(), new Map([["123", "456"]]));
    assertEquals(gameManager.getGameId("123"), "456");
  });

  it("should create new game and return the gameId after game setup", () => {
    const gameManager = new GameManager();
    const gameId = gameManager.createGame("123", players);

    const game = gameManager.getGame(gameId);

    assertEquals(gameId, "123");
    assertEquals(game!.players, playerDetails as Players);
  });

  it("should return undefined if no game exists with given gameId", () => {
    const gameManager = new GameManager();
    assertFalse(gameManager.getGame("111"));
  });

  it("should return game instance if game exists with given gameId", () => {
    const gameManager = new GameManager();
    const gameId = gameManager.createGame("111", players);

    assert(gameManager.getGame(gameId) instanceof Game);
  });

  it("should return true if the game exists", () => {
    const gameManager = new GameManager();
    const gameId = gameManager.createGame("111", players);

    assert(gameManager.hasGame(gameId));
  });

  it("should return false if the game does not exists", () => {
    const gameManager = new GameManager();

    assertFalse(gameManager.hasGame("111"));
  });

  it("should delete game and return true", () => {
    const gameManager = new GameManager();
    const gameId = gameManager.createGame("111", players);

    assert(gameManager.hasGame(gameId));
  });

  it("should remove the player from playerToGame map", () => {
    const gameManager = new GameManager(new Map(), new Map([["1", "123"]]));
    assertEquals(gameManager.getGameId("1"), "123");

    gameManager.removePlayerGameId("1");
    assertEquals(gameManager.getGameId("1"), undefined);
  });
});
