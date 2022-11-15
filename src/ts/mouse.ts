import { GameState } from "./gamestate";
import { clamp } from "./math";

export function doWheel(gameState: GameState, ev: WheelEvent) {
    gameState.rightPos.y = clamp(0, ev.deltaY + gameState.rightPos.y, 100);
}
