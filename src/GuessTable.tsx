import { Fragment, useMemo } from "react";
import type { GameConfig, GuessResult } from "./types";
import { getItemModule } from "./items";

type GuessTableProp = {
  config: GameConfig,
  guesses: GuessResult[],
}

const NAME_COLUMN_WIDTH = "130px";

function GuessTable({ config, guesses }: GuessTableProp) {
  const { gridTemplate, headers } = useMemo(() => {
    const widths: string[] = [NAME_COLUMN_WIDTH];
    const headerCells: { label: string; key: string }[] = [];
    config.items.forEach((item, i) => {
      const mod = getItemModule(item.kind);
      mod.columns(item).forEach((col, j) => {
        widths.push(col.width);
        headerCells.push({ label: col.label, key: `${i}-${j}` });
      });
    });
    return { gridTemplate: widths.join(" "), headers: headerCells };
  }, [config]);

  return (
    <div
      className="results-table"
      style={{ "gridTemplate": gridTemplate }}
    >
      <div className="table-header" style={{ gridTemplateColumns: gridTemplate }}>
        <div className="cell cell-name">宠物</div>
        {headers.map((h) => (
          <div key={h.key} className="cell">
            {h.label}
          </div>
        ))}
      </div>
      {guesses.map((g, rowIdx) => (
        <div
          key={rowIdx}
          className="table-row"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className={`cell cell-name ${g.isCorrect ? "correct" : ""}`}>
            {g.pet.displayName}
          </div>
          {config.items.map((item, i) => {
            const mod = getItemModule(item.kind);
            const fb = g.items[i].feedback;
            return (
              <Fragment key={i}>{mod.renderRow(fb, item)}</Fragment>
            );
          })}
        </div>
      ))}
    </div>
  )
}

export default GuessTable
