type GameOverDetails =
  | { winner: "Mr.X"; reason: "escaped" | "detectives-stuck" }
  | {
    winner: "Detectives";
    reason: "caught" | "mrX-trapped";
    caughtBy?: {
      name: string;
      color: string;
      station: number;
    };
  };

export const MrxEscaped = { winner: "Mr.X", reason: "escaped" };
export const detectiveStuck = { winner: "Mr.X", reason: "detectives-stuck" };
export const MrXTrapped = { winner: "Detectives", reason: "mrX-trapped" };
export const MrxCaught = {
  winner: "Detectives",
  reason: "caught",
  caughtBy: { name: "Blue", color: "#00f", station: 112 },
};
