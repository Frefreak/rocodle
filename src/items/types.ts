import type { ReactNode } from "react";
import type { Pet, GameItem } from "../types";

export interface ItemColumn {
  label: string;
  width: string; // CSS grid track value, e.g. "60px" or "120px"
}

// One self-contained unit of comparison + display.
// Each concrete module pins I (the GameItem variant it handles) and F (its feedback shape).
export interface ItemModule<I extends GameItem, F> {
  kind: I["kind"];
  columns(item: I): ItemColumn[];
  evaluate(guess: Pet, target: Pet, item: I): F;
  // Returns one ReactNode per column (length must match columns()).
  // Each element should carry its own key (column index is fine).
  renderRow(feedback: F, item: I): ReactNode[];
  // Reveal-panel block shown when the round ends.
  renderReveal(target: Pet, item: I): ReactNode;
}

// Type-erased shape used by the registry — concrete modules narrow it.
export type AnyItemModule = ItemModule<GameItem, unknown>;
