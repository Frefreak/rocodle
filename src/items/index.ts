import type { GameItem } from "../types";
import type { AnyItemModule } from "./types";
import { stats6Module } from "./stats6";
import { statsTotalModule } from "./statsTotal";
import { typeModule } from "./type";
import { evolvedModule } from "./evolved";
import { areaModule } from "./area";
import { habitatModule } from "./habitat";

const REGISTRY: Record<GameItem["kind"], AnyItemModule> = {
  stats6: stats6Module as AnyItemModule,
  statsTotal: statsTotalModule as AnyItemModule,
  type: typeModule as AnyItemModule,
  evolved: evolvedModule as AnyItemModule,
  area: areaModule as AnyItemModule,
  habitat: habitatModule as AnyItemModule,
};

export function getItemModule(kind: GameItem["kind"]): AnyItemModule {
  return REGISTRY[kind];
}

export type { ItemColumn, ItemModule, AnyItemModule } from "./types";
