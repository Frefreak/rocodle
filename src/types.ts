export interface PetType {
  id: number;
  name: string;
  zh: string;
}

export interface PetStats {
  hp: number;
  phyAtk: number;
  magAtk: number;
  phyDef: number;
  magDef: number;
  spd: number;
}

export interface Pet {
  id: number;
  name: string;
  displayName: string;
  mainType: PetType | null;
  subType: PetType | null;
  stats: PetStats;
}

// Feedback types
export type StatFeedback = "higher" | "lower" | "match";
export type TypeFeedback = "match" | "no_match" | "partial";

export type TypeFeedbackMode = "binary" | "ternary";
// binary: match or no_match only
// ternary: match, partial (one type overlaps), no_match

export interface GameConfig {
  maxGuesses: number;
  typeFeedbackMode: TypeFeedbackMode;
  statKeys: (keyof PetStats)[];
}

export interface StatGuessResult {
  key: keyof PetStats;
  value: number;
  feedback: StatFeedback;
}

export interface TypeGuessResult {
  guessMain: PetType | null;
  guessSub: PetType | null;
  mainFeedback: TypeFeedback;
  subFeedback: TypeFeedback;
}

export interface GuessResult {
  pet: Pet;
  stats: StatGuessResult[];
  types: TypeGuessResult;
  isCorrect: boolean;
}

export const DIFFICULTY_PRESETS: Record<string, GameConfig> = {
  easy: {
    maxGuesses: 10,
    typeFeedbackMode: "ternary",
    statKeys: ["hp", "phyAtk", "magAtk", "phyDef", "magDef", "spd"],
  },
  normal: {
    maxGuesses: 7,
    typeFeedbackMode: "ternary",
    statKeys: ["hp", "phyAtk", "magAtk", "phyDef", "magDef", "spd"],
  },
  hard: {
    maxGuesses: 5,
    typeFeedbackMode: "binary",
    statKeys: ["hp", "phyAtk", "magAtk", "phyDef", "magDef", "spd"],
  },
};

export const STAT_LABELS: Record<keyof PetStats, string> = {
  hp: "HP",
  phyAtk: "物攻",
  magAtk: "魔攻",
  phyDef: "物防",
  magDef: "魔防",
  spd: "速度",
};
