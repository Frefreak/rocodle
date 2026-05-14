import type { GameConfig, Pet } from "./types";
import { getItemModule } from "./items";
import { Fragment } from "react/jsx-runtime";

type GameOverProp = {
  gameOver: boolean,
  won: boolean,
  target: Pet | null,
  guessesLength: number,
  config: GameConfig,
  onResetClick: () => void,
}

function GameOver({ won, target, guessesLength, config, onResetClick }: GameOverProp) {
  if (!target) {
    return null;
  }
  return (
    <div className="game-over">
      {won ? (
        <div className="result-card win">
          <h2>恭喜！</h2>
          <p>
            你在 {guessesLength} 次尝试中猜到了{" "}
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
          {config.items.map((item, i) => {
            const mod = getItemModule(item.kind);
            return <Fragment key={i}>{mod.renderReveal(target, item)}</Fragment>;
          })}
        </div>
      </div>
      <button className="play-again" onClick={onResetClick}>
        再来一局
      </button>
    </div>
  )
}

export default GameOver
