import type { GameItem } from "../types";
import type { ItemModule } from "./types";

type EvolvedFb = "match" | "no_match";

interface EvolvedFeedback {
  guess: boolean;
  feedback: EvolvedFb;
}

type EvolvedItem = Extract<GameItem, { kind: "evolved" }>;

const TOOLTIPS: Record<EvolvedFb, string> = {
  match: "相同",
  no_match: "不同",
};

export const evolvedModule: ItemModule<EvolvedItem, EvolvedFeedback> = {
  kind: "evolved",
  columns: () => [{ label: "进化", width: "60px" }],
  evaluate: (guess, target) => ({
    guess: guess.evolved,
    feedback: guess.evolved === target.evolved ? "match" : "no_match",
  }),
  renderRow: (fb) => [
    <div
      key={0}
      className={`cell cell-evolved evolved-${fb.feedback}`}
      title={TOOLTIPS[fb.feedback]}
    >
      {fb.guess ? "已进化" : "未进化"}
    </div>,
  ],
  renderReveal: (target) => <span>进化: {target.evolved ? "已进化" : "未进化"}</span>,
};
