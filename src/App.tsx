import { useState, useEffect, useRef } from "react";

import { type Pet, type GameConfig, type GuessResult, DIFFICULTY_PRESETS } from "./types";
import { evaluateGuess, pickRandomPet } from "./gameLogic";

import "./App.css";
import Header from "./Header";
import DifficultySelector from "./DifficultySelector";
import GameOver from "./GameOver";
import Input, { type InputControl } from "./Input";
import GuessTable from "./GuessTable";


function App() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [target, setTarget] = useState<Pet | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);

  const config: GameConfig = DIFFICULTY_PRESETS[selectedDifficulty];

  useEffect(() => {
    fetch("/pets.json")
      .then((r) => r.json())
      .then((data: Pet[]) => {
        setPets(data);
        setTarget(pickRandomPet(data));
      });
  }, []);

  const guessedIds = new Set(guesses.map((g) => g.pet.id));

  const inputControlRef = useRef<InputControl>(null);

  const submitGuess = (pet: Pet) => {
    if (!target || gameOver) return;
    const result = evaluateGuess(pet, target, config);
    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);
    inputControlRef?.current?.reset(true);

    if (result.isCorrect) {
      setWon(true);
      setGameOver(true);
    } else if (newGuesses.length >= config.maxGuesses) {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setTarget(pickRandomPet(pets));
    setGuesses([]);
    setGameOver(false);
    setWon(false);
    inputControlRef?.current?.reset(true);
  };

  const changeDifficulty = (idx: number) => {
    setSelectedDifficulty(idx);
    resetGame();
  };

  if (!target) return <div className="loading">加载中...</div>;

  return (
    <div className="app">
      <Header />
      <DifficultySelector
        selected={selectedDifficulty}
        changeDifficulty={changeDifficulty}
        maxGuesses={config.maxGuesses} guessesLength={guesses.length} />

      {!gameOver && (
        <Input controlRef={inputControlRef}
          submitGuess={submitGuess} pets={pets} guessedIds={guessedIds} />
      )}

      {guesses.length > 0 && (
        <GuessTable config={config} guesses={guesses} />
      )}

      {gameOver &&
        <GameOver gameOver={gameOver} won={won} target={target}
          guessesLength={guesses.length} config={config}
          onResetClick={resetGame} />
      }
    </div>
  );
}

export default App;
