import { GameState, PADDLE_HEIGHT, PADDLE_SENSITIVITY } from "./gamestate";
import { MouseWheel } from "./mouse";

import { digit } from "./digits";
import { clamp } from "./math";


export class Playfield {
    public context: CanvasRenderingContext2D;
    public gameState: GameState = new GameState();
    public mouseHandler: MouseWheel = new MouseWheel();

    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        canvas.addEventListener('wheel', (ev) => this.mouseHandler.handle(ev) );
        this.context = context;
        this.mouseHandler.clear();
    }

    private midpoint_line() {
        let hw = 50; // left position is half court width
        let h = 100; // height of canvas

        this.context.clearRect(49, 0, 2, 100);

        this.context.beginPath(); // we're drawing a line from h=0 to h=100%

        this.context.setLineDash([1, 2.25]);

        this.context.moveTo(hw, 0); // start at half width, top
        this.context.lineTo(hw, h); // draw to half width, bottom

        // finish the path and draw it
        this.context.closePath();
        this.context.stroke();
    }

    private paddles() {
        // wipe the paddle row clear
        this.context.clearRect(this.gameState.leftPos.x,0,1,100);
        this.context.clearRect(this.gameState.rightPos.x,0,1,100);

        let delta = this.mouseHandler.clear();

        this.gameState.rightPos.y = clamp(0, (delta * PADDLE_SENSITIVITY) + this.gameState.rightPos.y, 100 - PADDLE_HEIGHT);

        this.context.fillRect(
            this.gameState.leftPos.x,
            this.gameState.leftPos.y,
            1, PADDLE_HEIGHT);

        this.context.fillRect(
            this.gameState.rightPos.x,
            this.gameState.rightPos.y,
            1, PADDLE_HEIGHT);
    }

    private ball() {

    }

    private score() {
        const digit_offset = 4;
        this.context.clearRect(0, 0, 100, 10);

        let s = '' + this.gameState.leftScore;
        let left = 50 - digit_offset;
        while(s != '') {
            digit(this.context, s.slice(-1), left);
            left -= digit_offset;
            s = s.slice(0,-1);
        }

        s = '' + this.gameState.rightScore;
        left = 51;
        while(s != '') {
            digit(this.context, s.slice(0, 1), left);
            left += digit_offset;
            s = s.slice(1);
        }
    }

    public frame(elapsed: DOMHighResTimeStamp): void {
        this.score();
        this.paddles();

        // TODO: simulate and draw the ball


        // draw the center court line. passing context so we don't need to put null guards everywhere
        this.midpoint_line();
    }
}
