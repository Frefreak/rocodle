import { useImperativeHandle, useRef, useState, type Ref } from "react"
import type { Pet } from "./types";

export type InputControl = {
  reset: (focus: boolean) => void;
}

type InputProp = {
  controlRef?: Ref<InputControl>,
  submitGuess: (_: Pet) => void,
  pets: Pet[],
  guessedIds: Set<number>,
}


function Input({controlRef, submitGuess, pets, guessedIds}: InputProp) {
  const [input, setInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<Pet[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(controlRef, () => ({
    reset: (focus: boolean) => {
      setInput("");
      setSuggestions([]);
      setSelectedIndex(-1);
      if (focus && inputRef) {
        inputRef.current?.focus();
      }
    }
  }));

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


  return (
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
  )
}

export default Input
