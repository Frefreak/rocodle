import type { GameItem } from "../types";
import type { ItemModule } from "./types";

type SetFb = "match" | "partial" | "no_match";

interface AreaFeedback {
  guess: string[];
  feedback: SetFb;
}

type AreaItem = Extract<GameItem, { kind: "area" }>;

const TOOLTIPS: Record<SetFb, string> = {
  match: "完全匹配",
  partial: "部分匹配",
  no_match: "不匹配",
};

function compareSets(guess: string[], target: string[]): SetFb {
  const g = new Set(guess);
  const t = new Set(target);
  if (g.size === t.size && [...g].every((x) => t.has(x))) return "match";
  for (const x of g) if (t.has(x)) return "partial";
  return "no_match";
}

const display = (xs: string[]) =>
  xs.length > 0 ? xs.map((a) => a.replace("图鉴", "")).join(" / ") : "无";

export const areaModule: ItemModule<AreaItem, AreaFeedback> = {
  kind: "area",
  columns: () => [{ label: "图鉴地区", width: "120px" }],
  evaluate: (guess, target) => ({
    guess: guess.area,
    feedback: compareSets(guess.area, target.area),
  }),
  renderRow: (fb) => [
    <div
      key={0}
      className={`cell cell-area area-${fb.feedback}`}
      title={TOOLTIPS[fb.feedback]}
    >
      {display(fb.guess)}
    </div>,
  ],
  renderReveal: (target) => <span>图鉴地区: {display(target.area)}</span>,
};
