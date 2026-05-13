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
  form: string | null;
  mainType: PetType | null;
  subType: PetType | null;
  area: string[];
  habitat: string | null;
  evolved: boolean;
  stats: PetStats;
}

export const STAT_KEYS: (keyof PetStats)[] = [
  "hp",
  "phyAtk",
  "magAtk",
  "phyDef",
  "magDef",
  "spd",
];

export const STAT_LABELS: Record<keyof PetStats, string> = {
  hp: "HP",
  phyAtk: "物攻",
  magAtk: "魔攻",
  phyDef: "物防",
  magDef: "魔防",
  spd: "速度",
};

// A GameItem is one configurable unit of comparison + display.
// Each kind has its own evaluator and renderer in src/items/.
export type GameItem =
  | { kind: "stats6" }
  | { kind: "statsTotal" }
  | { kind: "type"; mode: "binary" | "ternary" }
  | { kind: "evolved" }
  | { kind: "area" }
  | { kind: "habitat" };

export interface GameConfig {
  key: string;
  name: string;
  maxGuesses: number;
  items: GameItem[];
}

export interface ItemResult {
  kind: GameItem["kind"];
  feedback: unknown;
}

export interface GuessResult {
  pet: Pet;
  items: ItemResult[];
  isCorrect: boolean;
}

export const DIFFICULTY_PRESETS: GameConfig[] = [
  {
    key: 'easy',
    name: '简单',
    maxGuesses: 10,
    items: [
      { kind: "type", mode: "ternary" },
      { kind: "evolved" },
      { kind: "area" },
      { kind: "habitat" },
      { kind: "stats6" },
    ],
  },
  {
    key: 'normal',
    name: '普通',
    maxGuesses: 7,
    items: [
      { kind: "type", mode: "ternary" },
      { kind: "evolved" },
      { kind: "area" },
      { kind: "habitat" },
      { kind: "stats6" },
    ],
  },
  {
    key: 'hard',
    name: '困难',
    maxGuesses: 5,
    items: [
      { kind: "type", mode: "binary" },
      { kind: "evolved" },
      { kind: "area" },
      { kind: "habitat" },
      { kind: "statsTotal" },
    ],
  },
]
