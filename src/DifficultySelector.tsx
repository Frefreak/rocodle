import { DIFFICULTY_PRESETS } from "./types";

type DifficultySelectorProp = {
  selected: number,
  changeDifficulty: (_: number) => void,
  maxGuesses: number,
  guessesLength: number,
};

function DifficultySelector({selected: difficulty, changeDifficulty, maxGuesses, guessesLength}: DifficultySelectorProp) {
  return (
    <div className="difficulty-bar">
      <div className="difficulty-selector">
        {DIFFICULTY_PRESETS.map((d, i) => (
          <button
            key={d.key}
            className={`diff-btn ${i === difficulty ? "active" : ""}`}
            onClick={() => changeDifficulty(i)}
          >
            {d.name}
          </button>
        ))}
      </div>
      <span className="guess-count">
        {guessesLength}/{maxGuesses}
      </span>
    </div>
  )
}

export default DifficultySelector
