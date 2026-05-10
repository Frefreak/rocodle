import type { Pet, GameConfig, GuessResult, ItemResult } from "./types";
import { getItemModule } from "./items";

export function evaluateGuess(
  guess: Pet,
  target: Pet,
  config: GameConfig
): GuessResult {
  const items: ItemResult[] = config.items.map((item) => {
    const mod = getItemModule(item.kind);
    return { kind: item.kind, feedback: mod.evaluate(guess, target, item) };
  });

  return {
    pet: guess,
    items,
    isCorrect: guess.id === target.id,
  };
}

export function pickRandomPet(pets: Pet[]): Pet {
  return pets[Math.floor(Math.random() * pets.length)];
}
