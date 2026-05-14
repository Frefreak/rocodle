import type { Pet, GameItem } from "../types";
import { STAT_KEYS } from "../types";
import type { ItemModule } from "./types";

type TotalFeedback = "higher" | "lower" | "match";

interface StatsTotalFeedback {
  total: number;
  feedback: TotalFeedback;
}

type StatsTotalItem = Extract<GameItem, { kind: "statsTotal" }>;

function totalOf(p: Pet): number {
  return STAT_KEYS.reduce((sum, k) => sum + p.stats[k], 0);
}

const TOOLTIPS: Record<TotalFeedback, string> = {
  match: "正确",
  higher: "目标更高",
  lower: "目标更低",
};

export const statsTotalModule: ItemModule<StatsTotalItem, StatsTotalFeedback> = {
  kind: "statsTotal",
  columns: () => [{ label: "种族总和", width: "80px" }],
  evaluate: (guess, target) => {
    const g = totalOf(guess);
    const t = totalOf(target);
    const feedback: TotalFeedback = g === t ? "match" : g < t ? "higher" : "lower";
    return { total: g, feedback };
  },
  renderRow: (fb) => [
    <div
      key={0}
      className={`cell cell-stat statsTotal-${fb.feedback}`}
      title={TOOLTIPS[fb.feedback]}
    >
      <span className="stat-value">{fb.total}</span>
      <span className="arrow">
        {fb.feedback === "higher" ? "▲" : fb.feedback === "lower" ? "▼" : "✓"}
      </span>
    </div>,
  ],
  renderReveal: (target) => (
    <span>
      种族总和: <strong>{totalOf(target)}</strong>
    </span>
  ),
};
