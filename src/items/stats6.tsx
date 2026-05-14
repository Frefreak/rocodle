import type { PetStats, GameItem } from "../types";
import { STAT_KEYS, STAT_LABELS } from "../types";
import type { ItemModule } from "./types";

type StatFeedback = "higher" | "lower" | "match";

interface Stats6Feedback {
  cells: { key: keyof PetStats; value: number; feedback: StatFeedback }[];
}

type Stats6Item = Extract<GameItem, { kind: "stats6" }>;

function compareStat(g: number, t: number): StatFeedback {
  if (g === t) return "match";
  return g < t ? "higher" : "lower";
}

const ARROWS: Record<StatFeedback, string> = {
  higher: "▲",
  lower: "▼",
  match: "✓",
};

const TOOLTIPS: Record<StatFeedback, string> = {
  match: "正确",
  higher: "目标更高",
  lower: "目标更低",
};

export const stats6Module: ItemModule<Stats6Item, Stats6Feedback> = {
  kind: "stats6",
  columns: () => STAT_KEYS.map((k) => ({ label: STAT_LABELS[k], width: "60px" })),
  evaluate: (guess, target) => ({
    cells: STAT_KEYS.map((key) => ({
      key,
      value: guess.stats[key],
      feedback: compareStat(guess.stats[key], target.stats[key]),
    })),
  }),
  renderRow: (fb) =>
    fb.cells.map((s, i) => (
      <div
        key={i}
        className={`cell cell-stat stats6-${s.feedback}`}
        title={TOOLTIPS[s.feedback]}
      >
        <span className="stat-value">{s.value}</span>
        <span className="arrow">{ARROWS[s.feedback]}</span>
      </div>
    )),
  renderReveal: (target) => (
    <div className="reveal-stats">
      {STAT_KEYS.map((key) => (
        <div key={key} className="reveal-stat">
          <span className="reveal-stat-label">{STAT_LABELS[key]}</span>
          <span className="reveal-stat-value">{target.stats[key]}</span>
        </div>
      ))}
    </div>
  ),
};
