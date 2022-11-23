import { GameState } from "./gamestate";

export class MouseWheel {
    private accumulated: number = 0;

    constructor() {
        this.accumulated = 0;
    }

    public clear(): number {
        let accumulated = this.accumulated;
        this.accumulated = 0;
        return accumulated;
    }

    public wheelHandler(ev: WheelEvent) {
        if(ev.deltaY != 0) {
            this.accumulated += ev.deltaY / Math.abs(ev.deltaY);
        }
    }

    public createClickHandler(gameState: GameState) {
        let clickHandler = (ev: MouseEvent) => {
            if(ev.button == 1) {
                gameState.reset();
            }
        }
        clickHandler.bind(this);
        return clickHandler;
    }
}
