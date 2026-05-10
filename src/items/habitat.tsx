import type { GameItem } from "../types";
import type { ItemModule } from "./types";

type SetFb = "match" | "partial" | "no_match";

interface HabitatFeedback {
  guess: string | null;
  feedback: SetFb;
}

type HabitatItem = Extract<GameItem, { kind: "habitat" }>;

function split(s: string | null): string[] {
  if (!s) return [];
  return s
    .split(/[、,，]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function compareSets(guess: string[], target: string[]): SetFb {
  const g = new Set(guess);
  const t = new Set(target);
  if (g.size === t.size && [...g].every((x) => t.has(x))) return "match";
  for (const x of g) if (t.has(x)) return "partial";
  return "no_match";
}

export const habitatModule: ItemModule<HabitatItem, HabitatFeedback> = {
  kind: "habitat",
  columns: () => [{ label: "栖息地", width: "160px" }],
  evaluate: (guess, target) => ({
    guess: guess.habitat,
    feedback: compareSets(split(guess.habitat), split(target.habitat)),
  }),
  renderRow: (fb) => [
    <div key={0} className={`cell cell-habitat habitat-${fb.feedback}`}>
      {fb.guess ?? "无"}
    </div>,
  ],
  renderReveal: (target) => <span>栖息地: {target.habitat ?? "无"}</span>,
};
