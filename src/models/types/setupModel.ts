export interface MrxTickets {
  bus: number;
  taxi: number;
  underground: number;
  black: number;
}

export interface DetectiveTickets {
  bus: number;
  taxi: number;
  underground: number;
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
  inventory: { tickets: DetectiveTickets };
}

export interface MrX {
  id: string;
  name: string;
  color: string;
  isMrx: true;
  position: number;
  inventory: { tickets: MrxTickets; cards: Cards };
}

export interface MrxMove {
  ticket: string;
  position: number;
}
