export interface Tickets {
  bus: number;
  taxi: number;
  underground: number;
  black?: number;
}

export interface Cards {
  doubleMove: number;
}

export interface Detective {
  id: string;
  name: string;
  color: string;
  isMrx: false;
  position: number;
  inventory: { tickets: Tickets };
}

export interface GameMoveResponse {
  status: boolean;
  message?: string;
}

export interface MrXWon {
  winner: "Mr.X";
  name: string;
  message: string;
  mrxMoves: MrXMoveStatus[];
}

export interface DetectiveWin {
  winner: "Detective";
  color?: string;
  stationNumber?: number;
  name?: string;
  message: string;
}

export type WinDetails = MrXWon | DetectiveWin;

export interface Mrx {
  id: string;
  name: string;
  position?: number;
  color: string;
  isMrx: true;
  inventory: { tickets: Tickets; cards: Cards };
}

export interface Detective {
  id: string;
  name: string;
  color: string;
  isMrx: false;
  position: number;
  inventory: { tickets: Tickets };
}
export interface MrXMoveStatus {
  ticket: string | Cards;
  position?: number;
}

export type GameStatusPlayers = [
  Mrx,
  Detective,
  Detective,
  Detective,
  Detective,
  Detective,
];

export interface PossibleStations {
  taxi?: number[];
  bus?: number[];
  underground?: number[];
  black?: number[];
}

export interface GameStatus {
  you: number;
  currentPlayer: number;
  mrXMoves: MrXMoveStatus[];
  players: GameStatusPlayers;
  win?: WinDetails;
  stations: PossibleStations;
}
