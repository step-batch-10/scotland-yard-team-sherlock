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

export interface MrX {
  id: string;
  name: string;
  color: string;
  isMrx: true;
  position: number;
  inventory: { tickets: Tickets; cards: Cards };
}

export interface MrxMove {
  ticket: string;
  position: number;
}
