import { Coord } from "./coord";
import { PADDLE_H_OFFSET, PADDLE_HEIGHT } from "./constants";

export class GameState {
    leftScore: number = 0;
    rightScore: number = 0;

    ballPos: Coord = new Coord(1, 0);
    ballVector: Coord = new Coord(-1, 1);

    leftPos: Coord = new Coord(0, 0);
    rightPos: Coord = new Coord(0, 0);

    constructor() {
        this.reset();
    }

    public reset() {
        this.leftScore = 0;
        this.rightScore = 0;

        this.ballPos = new Coord(50, 0);

        this.leftPos = new Coord(PADDLE_H_OFFSET, 50 - PADDLE_HEIGHT/2);
        this.rightPos = new Coord(99 - PADDLE_H_OFFSET, 50 - PADDLE_HEIGHT/2);
    }
}
