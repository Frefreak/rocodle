import type {
  Pet,
  GameConfig,
  GuessResult,
  StatGuessResult,
  TypeGuessResult,
  StatFeedback,
  TypeFeedback,
} from "./types";

function comparestat(guessVal: number, targetVal: number): StatFeedback {
  if (guessVal === targetVal) return "match";
  return guessVal < targetVal ? "higher" : "lower";
}

function compareType(
  guessMain: Pet["mainType"],
  guessSub: Pet["subType"],
  targetMain: Pet["mainType"],
  targetSub: Pet["subType"],
  mode: GameConfig["typeFeedbackMode"]
): TypeGuessResult {
  const targetTypes = new Set<number>();
  if (targetMain) targetTypes.add(targetMain.id);
  if (targetSub) targetTypes.add(targetSub.id);

  const getTypeFeedback = (
    guessType: Pet["mainType"] | Pet["subType"],
    targetExact: Pet["mainType"] | Pet["subType"]
  ): TypeFeedback => {
    if (!guessType && !targetExact) return "match";
    if (!guessType || !targetExact) {
      if (mode === "binary") return "no_match";
      // ternary: check if the guess type exists somewhere in target types
      if (guessType && targetTypes.has(guessType.id)) return "partial";
      return "no_match";
    }
    if (guessType.id === targetExact.id) return "match";
    if (mode === "binary") return "no_match";
    // ternary: check if guess type exists in any target slot
    if (targetTypes.has(guessType.id)) return "partial";
    return "no_match";
  };

  return {
    guessMain: guessMain,
    guessSub: guessSub,
    mainFeedback: getTypeFeedback(guessMain, targetMain),
    subFeedback: getTypeFeedback(guessSub, targetSub),
  };
}

export function evaluateGuess(
  guess: Pet,
  target: Pet,
  config: GameConfig
): GuessResult {
  const stats: StatGuessResult[] = config.statKeys.map((key) => ({
    key,
    value: guess.stats[key],
    feedback: comparestat(guess.stats[key], target.stats[key]),
  }));

  const types = compareType(
    guess.mainType,
    guess.subType,
    target.mainType,
    target.subType,
    config.typeFeedbackMode
  );

  return {
    pet: guess,
    stats,
    types,
    isCorrect: guess.id === target.id,
  };
}

export function pickRandomPet(pets: Pet[]): Pet {
  return pets[Math.floor(Math.random() * pets.length)];
}
