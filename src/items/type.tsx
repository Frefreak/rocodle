import type { Pet, PetType, GameItem } from "../types";
import type { ItemModule } from "./types";

type TypeFb = "match" | "no_match" | "partial";

interface TypeFeedback {
  guessMain: PetType | null;
  guessSub: PetType | null;
  mainFeedback: TypeFb;
  subFeedback: TypeFb;
}

type TypeItem = Extract<GameItem, { kind: "type" }>;

function feedbackFor(
  guess: PetType | null,
  exact: PetType | null,
  targetIds: Set<number>,
  mode: TypeItem["mode"]
): TypeFb {
  if (!guess && !exact) return "match";
  if (!guess || !exact) {
    if (mode === "binary") return "no_match";
    if (guess && targetIds.has(guess.id)) return "partial";
    return "no_match";
  }
  if (guess.id === exact.id) return "match";
  if (mode === "binary") return "no_match";
  if (targetIds.has(guess.id)) return "partial";
  return "no_match";
}

export const typeModule: ItemModule<TypeItem, TypeFeedback> = {
  kind: "type",
  columns: () => [
    { label: "主属性", width: "60px" },
    { label: "副属性", width: "60px" },
  ],
  evaluate: (guess, target, item) => {
    const targetIds = new Set<number>();
    if (target.mainType) targetIds.add(target.mainType.id);
    if (target.subType) targetIds.add(target.subType.id);
    return {
      guessMain: guess.mainType,
      guessSub: guess.subType,
      mainFeedback: feedbackFor(guess.mainType, target.mainType, targetIds, item.mode),
      subFeedback: feedbackFor(guess.subType, target.subType, targetIds, item.mode),
    };
  },
  renderRow: (fb) => [
    <div key={0} className={`cell cell-type type-${fb.mainFeedback}`}>
      {fb.guessMain?.zh ?? "无"}
    </div>,
    <div key={1} className={`cell cell-type type-${fb.subFeedback}`}>
      {fb.guessSub?.zh ?? "无"}
    </div>,
  ],
  renderReveal: (target: Pet) => (
    <span>
      属性: {target.mainType?.zh ?? "无"}
      {target.subType ? ` / ${target.subType.zh}` : ""}
    </span>
  ),
};
