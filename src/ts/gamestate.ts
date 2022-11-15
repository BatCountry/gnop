import { Coord } from "./coord";

export const PADDLE_HEIGHT = 5;
export const PADDLE_H_OFFSET = 5;


export class GameState {
    leftScore: number = 0;
    rightScore: number = 0;

    ballPos: Coord = new Coord(0, 0);
    ballVector: Coord = new Coord(0, 0);

    leftPos: Coord = new Coord(0, 0);
    rightPos: Coord = new Coord(0, 0);

    constructor() {
        this.reset();
    }

    public reset() {
        this.leftScore = 0;
        this.rightScore = 0;

        this.ballPos = new Coord(0, 50);

        this.leftPos = new Coord(PADDLE_H_OFFSET, 50 - PADDLE_HEIGHT/2);
        this.rightPos = new Coord(99 - PADDLE_H_OFFSET, 50 - PADDLE_HEIGHT/2);
    }
}
