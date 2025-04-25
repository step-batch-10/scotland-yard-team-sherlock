export interface Player {
  name: string;
  id: string;
  color: string;
  position: number;
}

export interface GameOverDetails {
  detective: string;
  color: string;
  station: number;
}

export interface MrxTicketsStatus {
  bus: number;
  taxi: number;
  underground: number;
  black: number;
}
export interface DetectiveTicketsStatus {
  bus: number;
  taxi: number;
  underground: number;
}

export interface Cards {
  doubleMove: number;
}

export interface MrxStatus {
  id: string;
  name: string;
  position?: number;
  color: string;
  isMrx: true;
  inventory: { tickets: MrxTicketsStatus; cards: Cards };
}

export interface DetectiveStatus {
  id: string;
  name: string;
  position: number;
  color: string;
  isMrx: false;
  inventory: { tickets: DetectiveTicketsStatus };
}
export interface MrXMoveStatus {
  ticket: string;
  position?: number;
}

export type GameStatusPlayers = [
  MrxStatus,
  DetectiveStatus,
  DetectiveStatus,
  DetectiveStatus,
  DetectiveStatus,
  DetectiveStatus,
];

export interface GameStatus {
  you: number;
  currentPlayer: number;
  mrXMoves: MrXMoveStatus[];
  players: GameStatusPlayers;
  gameEndDetails?: GameOverDetails;
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
            color: "#ffb347",
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
            color: "#63a4ff",
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
            color: "#ffb347",
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
            color: "#63a4ff",
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
            color: "#ffb347",
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
            color: "#63a4ff",
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
            color: "#ffb347",
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
            color: "#63a4ff",
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
      },
    },
  },
};
