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
  stations: Stations;
}

export const mockStates = {
  mrx: {
    "one": {
      desc: "mrx position is revealed as player is mrx",
      data: {
        you: 0,
        currentPlayer: 3,
        players: [
          {
            name: "Mr. X",
            color: "black",
            position: 3,
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
            position: 9,
            inventory: {
              tickets: { taxi: 8, bus: 6, underground: 3, black: 0 },
            },
          },
        ],
        mrXMoves: [
          { ticket: "taxi" },
        ],
        stations: {
          taxi: [73, 75],
          bus: [],
          underground: [105],
          black: [],
        },
      },
    },
    "two": {
      desc: "mrx position is revealed as this is reveal round",
      data: {
        you: 0,
        currentPlayer: 3,
        players: [
          {
            name: "Mr. X",
            color: "black",
            position: 8,
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
            position: 9,
            inventory: {
              tickets: { taxi: 8, bus: 6, underground: 3, black: 0 },
            },
          },
        ],
        mrXMoves: [
          { ticket: "taxi" },
          { ticket: "underground", position: 8 },
        ],
        stations: {
          taxi: [73, 75],
          bus: [],
          underground: [105],
          black: [],
        },
      },
    },
  },
  detective: {
    "one": {
      desc: "mrx position is revealed as player is mrx",
      data: {
        you: 1,
        currentPlayer: 3,
        players: [
          {
            name: "Mr. X",
            color: "black",
            position: null,
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
            position: 9,
            inventory: {
              tickets: { taxi: 8, bus: 6, underground: 3, black: 0 },
            },
          },
        ],
        mrXMoves: [
          { ticket: "taxi" },
        ],
        stations: {
          taxi: [73, 75],
          bus: [],
          underground: [105],
          black: [],
        },
      },
    },
    "two": {
      desc: "mrx position is revealed to detective as this is reveal round",
      data: {
        you: 2,
        currentPlayer: 3,
        players: [
          {
            name: "Mr. X",
            color: "black",
            position: 8,
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
            position: 9,
            inventory: {
              tickets: { taxi: 8, bus: 6, underground: 3, black: 0 },
            },
          },
        ],
        mrXMoves: [
          { ticket: "taxi" },
          { ticket: "underground", position: 8 },
        ],
        stations: {
          taxi: [73, 75],
          bus: [],
          underground: [105],
          black: [],
        },
      },
    },
  },
};
