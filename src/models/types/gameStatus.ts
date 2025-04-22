interface Tickets {
  bus: number;
  taxi: number;
  underground: number;
  black: number;
}

interface Cards {
  doubleMove: number;
}

interface Detective {
  name: string;
  color: string;
  position: number;
  inventory: { tickets: Tickets };
}

interface MrX {
  name: string;
  color: string;
  position?: number;
  inventory: { tickets: Tickets; cards: Cards };
}

interface Stations {
  bus: number[];
  taxi: number[];
  underground: number[];
  black: number[];
}

interface MrXMove {
  ticket: string;
  position?: number;
}

export interface GameStatus {
  you: number;
  currentPlayer: number;
  players: [MrX, Detective, Detective, Detective, Detective, Detective];
  mrXMoves: MrXMove[];
  stations?: Stations;
}
// we can put MrX separately
export const gameStates: GameStatus[] = [
  // Turn 1: Mr. X's turn
  {
    you: 1,
    currentPlayer: 0,
    players: [
      {
        name: "Mr. X",
        color: "black",
        inventory: {
          tickets: { taxi: 4, bus: 4, underground: 3, black: 2 },
          cards: { doubleMove: 2 },
        },
      },
      {
        name: "Red",
        color: "red",
        position: 13,
        inventory: {
          tickets: { taxi: 10, bus: 8, underground: 4, black: 0 },
        },
      },
      {
        name: "Blue",
        color: "blue",
        position: 25,
        inventory: {
          tickets: { taxi: 7, bus: 6, underground: 3, black: 0 },
        },
      },
      {
        name: "Green",
        color: "green",
        position: 30,
        inventory: {
          tickets: { taxi: 6, bus: 4, underground: 2, black: 0 },
        },
      },
      {
        name: "Yellow",
        color: "yellow",
        position: 19,
        inventory: {
          tickets: { taxi: 9, bus: 7, underground: 3, black: 0 },
        },
      },
      {
        name: "Purple",
        color: "purple",
        position: 34,
        inventory: {
          tickets: { taxi: 8, bus: 6, underground: 3, black: 0 },
        },
      },
    ],
    mrXMoves: [{ ticket: "taxi" }],
    stations: {
      taxi: [12, 14],
      bus: [15],
      underground: [],
      black: [],
    },
  },

  // Turn 2: Red's turn
  {
    you: 1,
    currentPlayer: 1,
    players: [
      {
        name: "Mr. X",
        color: "black",
        inventory: {
          tickets: { taxi: 3, bus: 4, underground: 3, black: 2 },
          cards: { doubleMove: 2 },
        },
      },
      {
        name: "Red",
        color: "red",
        position: 13,
        inventory: {
          tickets: { taxi: 9, bus: 8, underground: 4, black: 0 },
        },
      },
      {
        name: "Blue",
        color: "blue",
        position: 25,
        inventory: {
          tickets: { taxi: 7, bus: 6, underground: 3, black: 0 },
        },
      },
      {
        name: "Green",
        color: "green",
        position: 30,
        inventory: {
          tickets: { taxi: 6, bus: 4, underground: 2, black: 0 },
        },
      },
      {
        name: "Yellow",
        color: "yellow",
        position: 19,
        inventory: {
          tickets: { taxi: 9, bus: 7, underground: 3, black: 0 },
        },
      },
      {
        name: "Purple",
        color: "purple",
        position: 34,
        inventory: {
          tickets: { taxi: 8, bus: 6, underground: 3, black: 0 },
        },
      },
    ],
    mrXMoves: [{ ticket: "taxi" }, { ticket: "bus" }],
    stations: {
      taxi: [12, 14],
      bus: [22],
      underground: [],
      black: [],
    },
  },

  // Turn 3: Blue's turn
  {
    you: 2,
    currentPlayer: 2,
    players: [
      {
        name: "Mr. X",
        color: "black",
        inventory: {
          tickets: { taxi: 3, bus: 3, underground: 3, black: 2 },
          cards: { doubleMove: 2 },
        },
      },
      {
        name: "Red",
        color: "red",
        position: 22,
        inventory: {
          tickets: { taxi: 8, bus: 8, underground: 4, black: 0 },
        },
      },
      {
        name: "Blue",
        color: "blue",
        position: 25,
        inventory: {
          tickets: { taxi: 6, bus: 6, underground: 3, black: 0 },
        },
      },
      {
        name: "Green",
        color: "green",
        position: 30,
        inventory: {
          tickets: { taxi: 6, bus: 4, underground: 2, black: 0 },
        },
      },
      {
        name: "Yellow",
        color: "yellow",
        position: 19,
        inventory: {
          tickets: { taxi: 9, bus: 7, underground: 3, black: 0 },
        },
      },
      {
        name: "Purple",
        color: "purple",
        position: 34,
        inventory: {
          tickets: { taxi: 8, bus: 6, underground: 3, black: 0 },
        },
      },
    ],
    mrXMoves: [{ ticket: "taxi" }, { ticket: "bus" }, { ticket: "taxi" }],
    stations: {
      taxi: [24, 26],
      bus: [33],
      underground: [],
      black: [],
    },
  },

  // Turn 4: Mr. X uses underground (no reveal)
  {
    you: 1,
    currentPlayer: 0,
    players: [
      {
        name: "Mr. X",
        color: "black",
        inventory: {
          tickets: { taxi: 3, bus: 3, underground: 2, black: 2 },
          cards: { doubleMove: 2 },
        },
      },
      {
        name: "Red",
        color: "red",
        position: 22,
        inventory: {
          tickets: { taxi: 8, bus: 8, underground: 4, black: 0 },
        },
      },
      {
        name: "Blue",
        color: "blue",
        position: 26,
        inventory: {
          tickets: { taxi: 5, bus: 6, underground: 3, black: 0 },
        },
      },
      {
        name: "Green",
        color: "green",
        position: 30,
        inventory: {
          tickets: { taxi: 6, bus: 4, underground: 2, black: 0 },
        },
      },
      {
        name: "Yellow",
        color: "yellow",
        position: 19,
        inventory: {
          tickets: { taxi: 9, bus: 7, underground: 3, black: 0 },
        },
      },
      {
        name: "Purple",
        color: "purple",
        position: 34,
        inventory: {
          tickets: { taxi: 8, bus: 6, underground: 3, black: 0 },
        },
      },
    ],
    mrXMoves: [
      { ticket: "taxi" },
      { ticket: "bus" },
      { ticket: "taxi" },
      { ticket: "underground" },
    ],
    stations: {
      taxi: [12, 14],
      bus: [15],
      underground: [74],
      black: [],
    },
  },

  // Turn 5: Reveal turn (Mr. X at 74)
  {
    you: 1,
    currentPlayer: 3,
    players: [
      {
        name: "Mr. X",
        color: "black",
        position: 74,
        inventory: {
          tickets: { taxi: 3, bus: 3, underground: 1, black: 2 },
          cards: { doubleMove: 2 },
        },
      },
      {
        name: "Red",
        color: "red",
        position: 22,
        inventory: {
          tickets: { taxi: 8, bus: 8, underground: 4, black: 0 },
        },
      },
      {
        name: "Blue",
        color: "blue",
        position: 26,
        inventory: {
          tickets: { taxi: 5, bus: 6, underground: 3, black: 0 },
        },
      },
      {
        name: "Green",
        color: "green",
        position: 30,
        inventory: {
          tickets: { taxi: 6, bus: 4, underground: 2, black: 0 },
        },
      },
      {
        name: "Yellow",
        color: "yellow",
        position: 19,
        inventory: {
          tickets: { taxi: 9, bus: 7, underground: 3, black: 0 },
        },
      },
      {
        name: "Purple",
        color: "purple",
        position: 34,
        inventory: {
          tickets: { taxi: 8, bus: 6, underground: 3, black: 0 },
        },
      },
    ],
    mrXMoves: [
      { ticket: "taxi" },
      { ticket: "bus" },
      { ticket: "taxi" },
      { ticket: "underground" },
      { ticket: "underground", position: 74 },
    ],
    stations: {
      taxi: [73, 75],
      bus: [],
      underground: [105],
      black: [],
    },
  },
];
