import { useState, useEffect, useCallback, useRef } from "react";
import type { Pet, GameConfig, GuessResult } from "./types";
import { DIFFICULTY_PRESETS, STAT_LABELS } from "./types";
import { evaluateGuess, pickRandomPet } from "./gameLogic";
import "./App.css";

function App() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [target, setTarget] = useState<Pet | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Pet[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [difficulty, setDifficulty] = useState<string>("normal");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const config: GameConfig = DIFFICULTY_PRESETS[difficulty];

  useEffect(() => {
    fetch("/pets.json")
      .then((r) => r.json())
      .then((data: Pet[]) => {
        setPets(data);
        setTarget(pickRandomPet(data));
      });
  }, []);

  const guessedIds = new Set(guesses.map((g) => g.pet.id));

  const handleInputChange = (val: string) => {
    setInput(val);
    setSelectedIndex(-1);
    if (val.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const lower = val.toLowerCase();
    const matches = pets
      .filter(
        (p) =>
          !guessedIds.has(p.id) &&
          (p.displayName.toLowerCase().includes(lower) ||
            p.name.toLowerCase().includes(lower))
      )
      .slice(0, 8);
    setSuggestions(matches);
  };

  const submitGuess = useCallback(
    (pet: Pet) => {
      if (!target || gameOver) return;
      const result = evaluateGuess(pet, target, config);
      const newGuesses = [...guesses, result];
      setGuesses(newGuesses);
      setInput("");
      setSuggestions([]);
      setSelectedIndex(-1);

      if (result.isCorrect) {
        setWon(true);
        setGameOver(true);
      } else if (newGuesses.length >= config.maxGuesses) {
        setGameOver(true);
      }
    },
    [target, gameOver, config, guesses]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        submitGuess(suggestions[selectedIndex]);
      }
    }
  };

  const resetGame = () => {
    setTarget(pickRandomPet(pets));
    setGuesses([]);
    setGameOver(false);
    setWon(false);
    setInput("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const changeDifficulty = (d: string) => {
    setDifficulty(d);
    resetGame();
  };

  if (!target) return <div className="loading">加载中...</div>;

  return (
    <div className="app">
      <h1 className="title">Rocodle</h1>
      <p className="subtitle">猜猜这是哪只洛克王国宠物！</p>

      <div className="controls">
        <div className="difficulty-selector">
          {Object.keys(DIFFICULTY_PRESETS).map((d) => (
            <button
              key={d}
              className={`diff-btn ${d === difficulty ? "active" : ""}`}
              onClick={() => changeDifficulty(d)}
            >
              {d === "easy" ? "简单" : d === "normal" ? "普通" : "困难"}
            </button>
          ))}
        </div>
        <span className="guess-count">
          {guesses.length}/{config.maxGuesses}
        </span>
      </div>

      {!gameOver && (
        <div className="input-area">
          <div className="search-container">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入宠物名称..."
              autoFocus
            />
            {suggestions.length > 0 && (
              <ul className="suggestions">
                {suggestions.map((pet, i) => (
                  <li
                    key={pet.id}
                    className={i === selectedIndex ? "selected" : ""}
                    onClick={() => submitGuess(pet)}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <span className="suggestion-name">{pet.displayName}</span>
                    <span className="suggestion-types">
                      {pet.mainType?.zh}
                      {pet.subType ? `/${pet.subType.zh}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {guesses.length > 0 && (
        <div className="results-table">
          <div className="table-header">
            <div className="cell cell-name">宠物</div>
            <div className="cell cell-type">主属性</div>
            <div className="cell cell-type">副属性</div>
            <div className="cell cell-evolved">进化</div>
            <div className="cell cell-area">图鉴地区</div>
            <div className="cell cell-habitat">栖息地</div>
            {config.statKeys.map((key) => (
              <div key={key} className="cell cell-stat">
                {STAT_LABELS[key]}
              </div>
            ))}
          </div>
          {guesses.map((g, i) => (
            <div key={i} className="table-row">
              <div className={`cell cell-name ${g.isCorrect ? "correct" : ""}`}>
                {g.pet.displayName}
              </div>
              <div className={`cell cell-type fb-${g.types.mainFeedback}`}>
                {g.types.guessMain?.zh ?? "无"}
              </div>
              <div className={`cell cell-type fb-${g.types.subFeedback}`}>
                {g.types.guessSub?.zh ?? "无"}
              </div>
              <div className={`cell cell-evolved fb-${g.evolved.feedback}`}>
                {g.evolved.guess ? "已进化" : "未进化"}
              </div>
              <div className={`cell cell-area fb-${g.area.feedback}`}>
                {g.area.guess.length > 0
                  ? g.area.guess.map((a) => a.replace("图鉴", "")).join(" / ")
                  : "无"}
              </div>
              <div className={`cell cell-habitat fb-${g.habitat.feedback}`}>
                {g.habitat.guess ?? "无"}
              </div>
              {g.stats.map((s) => (
                <div key={s.key} className={`cell cell-stat fb-${s.feedback}`}>
                  <span className="stat-value">{s.value}</span>
                  {s.feedback === "higher" && <span className="arrow">▲</span>}
                  {s.feedback === "lower" && <span className="arrow">▼</span>}
                  {s.feedback === "match" && <span className="arrow">✓</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          {won ? (
            <div className="result-card win">
              <h2>恭喜！</h2>
              <p>
                你在 {guesses.length} 次尝试中猜到了{" "}
                <strong>{target.displayName}</strong>！
              </p>
            </div>
          ) : (
            <div className="result-card lose">
              <h2>很遗憾！</h2>
              <p>
                正确答案是 <strong>{target.displayName}</strong>
              </p>
            </div>
          )}
          <div className="reveal-card">
            <h3>{target.displayName}</h3>
            <div className="reveal-info">
              <span>
                属性: {target.mainType?.zh ?? "无"}
                {target.subType ? ` / ${target.subType.zh}` : ""}
              </span>
              <span>进化: {target.evolved ? "已进化" : "未进化"}</span>
              <span>
                图鉴地区:{" "}
                {target.area.length > 0
                  ? target.area.map((a) => a.replace("图鉴", "")).join(" / ")
                  : "无"}
              </span>
              <span>栖息地: {target.habitat ?? "无"}</span>
              <div className="reveal-stats">
                {Object.entries(target.stats).map(([key, val]) => (
                  <div key={key} className="reveal-stat">
                    <span className="reveal-stat-label">
                      {STAT_LABELS[key as keyof typeof STAT_LABELS]}
                    </span>
                    <span className="reveal-stat-value">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className="play-again" onClick={resetGame}>
            再来一局
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
