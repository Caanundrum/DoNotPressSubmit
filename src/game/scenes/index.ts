import type { SceneDef } from "../types";
import { act1Scenes } from "./act1";
import { act2Scenes } from "./act2";
import { act3Scenes } from "./act3";
import { act4Scenes } from "./act4";
import { act5Scenes } from "./act5";

export const ALL_SCENES: SceneDef[] = [
  ...act1Scenes,
  ...act2Scenes,
  ...act3Scenes,
  ...act4Scenes,
  ...act5Scenes,
];

const byId = new Map(ALL_SCENES.map((s) => [s.id, s]));

export function getScene(id: string): SceneDef | undefined {
  return byId.get(id);
}

export function listSceneIds() {
  return ALL_SCENES.map((s) => s.id);
}
