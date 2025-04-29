import { describe, it } from "testing/bdd";
import { assert, assertEquals } from "assert";
import { Game } from "../../src/models/game.ts";
import { Players } from "../../src/models/gameManager.ts";

const initGameSetup = (index: number): Players => {
  const states = [
    {
      desc: "all have zero bus tickets",
      data: [
        {
          name: "aaa",
          id: "111",
          color: "black",
          isMrx: true,
          position: 1,
          inventory: {
            tickets: { bus: 0, taxi: 4, underground: 3, black: 5 },
            cards: { doubleMove: 2 },
          },
        },
        {
          name: "bbb",
          id: "222",
          color: "#63a4ff",
          position: 2,
          isMrx: false,
          inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
        },
        {
          name: "ccc",
          id: "333",
          color: "#ffb347",
          position: 10,
          isMrx: false,
          inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
        },
        {
          name: "ddd",
          id: "444",
          color: "red",
          position: 4,
          isMrx: false,
          inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
        },
        {
          name: "eee",
          id: "555",
          color: "blue",
          position: 5,
          isMrx: false,
          inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
        },
        {
          name: "fff",
          id: "666",
          color: "violet",
          position: 6,
          isMrx: false,
          inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
        },
      ],
    },
    {
      desc: "start pos is 1 to 6",
      data: [
        {
          name: "aaa",
          id: "111",
          color: "black",
          isMrx: true,
          position: 1,
          inventory: {
            tickets: { bus: 0, taxi: 4, underground: 3, black: 5 },
            cards: { doubleMove: 2 },
          },
        },
        {
          name: "bbb",
          id: "222",
          color: "#63a4ff",
          position: 2,
          isMrx: false,
          inventory: { tickets: { bus: 10, taxi: 24, underground: 4 } },
        },
        {
          name: "ccc",
          id: "333",
          color: "#ffb347",
          position: 3,
          isMrx: false,
          inventory: { tickets: { bus: 10, taxi: 24, underground: 4 } },
        },
        {
          name: "ddd",
          id: "444",
          color: "red",
          position: 4,
          isMrx: false,
          inventory: { tickets: { bus: 10, taxi: 24, underground: 4 } },
        },
        {
          name: "eee",
          id: "555",
          color: "blue",
          position: 5,
          isMrx: false,
          inventory: { tickets: { bus: 10, taxi: 24, underground: 4 } },
        },
        {
          name: "fff",
          id: "666",
          color: "violet",
          position: 6,
          isMrx: false,
          inventory: { tickets: { bus: 10, taxi: 24, underground: 4 } },
        },
      ],
    },
    {
      desc: "mrX will block setup",
      data: [
        {
          name: "aaa",
          id: "111",
          color: "black",
          isMrx: true,
          position: 10,
          inventory: {
            tickets: { bus: 0, taxi: 4, underground: 3, black: 5 },
            cards: { doubleMove: 2 },
          },
        },
        {
          name: "bbb",
          id: "222",
          color: "#63a4ff",
          position: 11,
          isMrx: false,
          inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
        },
        {
          name: "ccc",
          id: "333",
          color: "#ffb347",
          position: 20,
          isMrx: false,
          inventory: { tickets: { bus: 10, taxi: 10, underground: 4 } },
        },
        {
          name: "ddd",
          id: "444",
          color: "red",
          position: 3,
          isMrx: false,
          inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
        },
        {
          name: "eee",
          id: "555",
          color: "blue",
          position: 4,
          isMrx: false,
          inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
        },
        {
          name: "fff",
          id: "666",
          color: "violet",
          position: 5,
          isMrx: false,
          inventory: { tickets: { bus: 0, taxi: 10, underground: 4 } },
        },
      ],
    },
  ];

  return states[index].data as Players;
};

describe("Game Test", () => {
  it("should return invalid move if ticket count is zero", () => {
    const game = new Game(initGameSetup(0));
    const { status, message } = game.move("111", { to: 9, ticket: "bus" });

    assertEquals(status, false);
    assertEquals(message, "Invalid move");
  });

  it("should return invalid move if station is not reachable", () => {
    const game = new Game(initGameSetup(0));
    const { status, message } = game.move("111", { to: 10, ticket: "taxi" });

    assertEquals(status, false);
    assertEquals(message, "Invalid move");
  });

  it("should return not your move if it is not your turn", () => {
    const game = new Game(initGameSetup(0));
    const { status, message } = game.move("222", { to: 10, ticket: "taxi" });

    assertEquals(status, false);
    assertEquals(message, "Not Your Move ..!");
  });

  it("should return moved to some station when move is valid", () => {
    const game = new Game(initGameSetup(0));
    const { status, message } = game.move("111", { ticket: "black", to: 46 });

    assertEquals(status, true);
    assertEquals(message, "Moved to 46");
  });

  it("should return station already occupied when detective move over another detective", () => {
    const game = new Game(initGameSetup(0));
    game.move("111", { ticket: "black", to: 46 });

    const { status, message } = game.move("222", { to: 10, ticket: "taxi" });

    assertEquals(status, false);
    assertEquals(message, "Station already occupied ..!");
  });

  it("should reduce the detective ticket count and increase mrx ticket count if it is a valid detective move", () => {
    const game = new Game(initGameSetup(0));
    game.move("111", { ticket: "black", to: 46 });
    game.move("222", { to: 20, ticket: "taxi" });

    const gameStatus = game.gameStatus("222");

    assertEquals(gameStatus.players[1].inventory.tickets.taxi, 9);
    assertEquals(gameStatus.players[2].inventory.tickets.taxi, 10);
    assertEquals(gameStatus.players[0].inventory.tickets.taxi, 5);
  });

  it("should declare Mr. X as winner if 24 turns are completed and he is not caught", () => {
    const game = new Game(initGameSetup(1));

    type Ticket = "taxi" | "bus" | "underground" | "black";
    type Move = { ticket: Ticket; to: number };
    type PlayerId = string;

    const moves1: [PlayerId, Move][] = [
      ["111", { ticket: "taxi", to: 8 }],
      ["222", { ticket: "taxi", to: 20 }],
      ["333", { ticket: "taxi", to: 12 }],
      ["444", { ticket: "taxi", to: 13 }],
      ["555", { ticket: "taxi", to: 16 }],
      ["666", { ticket: "taxi", to: 29 }],
    ];

    const moves2: [PlayerId, Move][] = [
      ["111", { ticket: "taxi", to: 1 }],
      ["222", { ticket: "taxi", to: 2 }],
      ["333", { ticket: "taxi", to: 3 }],
      ["444", { ticket: "taxi", to: 4 }],
      ["555", { ticket: "taxi", to: 5 }],
      ["666", { ticket: "taxi", to: 6 }],
    ];

    for (let i = 0; i < 12; i++) {
      for (const [id, move] of moves1) {
        game.move(id, move);
      }
      for (const [id, move] of moves2) {
        game.move(id, move);
      }
    }

    const status = game.gameStatus("111");
    assertEquals(status.win?.winner, "Mr.X");
    assertEquals(status.win?.name, "aaa");
    assertEquals(status.win?.message, "Mr. X has evaded capture for 24 moves!");
  });
  it("should reduce mrx ticket count if it is a valid move", () => {
    const game = new Game(initGameSetup(0));
    game.move("111", { ticket: "black", to: 46 });

    const gameStatus = game.gameStatus("111");

    assertEquals(gameStatus.players[0].inventory.tickets.black, 4);
  });

  it("should give the game over details when detective step over mrx", () => {
    const game = new Game(initGameSetup(1));

    const m1 = game.move("111", { ticket: "black", to: 46 });
    const m2 = game.move("222", { ticket: "taxi", to: 20 });
    const m3 = game.move("333", { ticket: "bus", to: 23 });
    const m4 = game.move("444", { ticket: "taxi", to: 3 });
    const m5 = game.move("555", { ticket: "taxi", to: 15 });
    const m6 = game.move("666", { ticket: "taxi", to: 7 });

    const m11 = game.move("111", { ticket: "black", to: 13 });
    const m22 = game.move("222", { ticket: "taxi", to: 2 });
    game.move("333", { ticket: "taxi", to: 13 });

    assertEquals(m1.status, true);
    assertEquals(m2.status, true);
    assertEquals(m3.status, true);
    assertEquals(m4.status, true);
    assertEquals(m5.status, true);
    assertEquals(m6.status, true);

    assertEquals(m11.status, true);
    assertEquals(m22.status, true);
  });

  it("Should game over details when mr.X blocked", () => {
    const game = new Game(initGameSetup(2));
    const m1 = game.move("111", { ticket: "taxi", to: 2 });
    const m2 = game.move("222", { ticket: "taxi", to: 10 });

    assert(m1.status);
    assert(m2.status);

    const gameStatus = game.gameStatus("111");
    const win = gameStatus.win;
    const expected = {
      winner: "Detective",
      message: "Mr.X got blocked by Detectives",
    };

    assertEquals(win, expected);
  });

  it("should not change the current player if the isDoubleUsed is true", () => {
    const game = new Game(initGameSetup(1));
    game.move("111", { to: 8, ticket: "taxi", isDoubleUsed: true });
    assertEquals(game.currentPlayer, 0);
  });

  it("should give the message as You can't use double move card again if Mrx uses double card while one double card round running", () => {
    const game = new Game(initGameSetup(1));
    game.move("111", { to: 8, ticket: "taxi", isDoubleUsed: true });
    const move = game.move("111", {
      to: 18,
      ticket: "taxi",
      isDoubleUsed: true,
    });

    assertEquals(game.currentPlayer, 0);
    assertEquals(move.status, false);
    assertEquals(move.message, "You can't use double move card again");
  });

  it("Should return all possible staion form a current station if a specific ticket is present", () => {
    const game = new Game(initGameSetup(2));
    game.move("222", { ticket: "taxi", to: 7 });

    const gameStatus = game.gameStatus("222");

    assertEquals(gameStatus.stations, { taxi: [10, 22] });
  });
});
