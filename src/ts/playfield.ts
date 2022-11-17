import { PADDLE_HEIGHT, PADDLE_SENSITIVITY, BASE_BALL_SPEED, MAXFPS } from "./constants";
import { GameState } from "./gamestate";
import { MouseWheel } from "./mouse";

import { digit } from "./digits";
import { clamp } from "./math";
import { Coord } from "./coord";


export class Playfield {
    public context: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
    public gameState: GameState = new GameState();
    public mouseHandler: MouseWheel = new MouseWheel();
    public lastFrame: number = NaN;

    yLim: number = 1;

    public attachCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        canvas.addEventListener('wheel', (ev) => this.mouseHandler.handle(ev) );
        this.context = context;
    }

    constructor() {
        this.mouseHandler.clear();
    }

    private midpoint_line() {
        let hw = new Coord(50, 100); // left position is half court width

        this.context.beginPath(); // we're drawing a line from h=0 to h=100%

        this.context.setLineDash([1, 2.25]);

        this.context.moveTo(hw.x, 0); // start at half width, top
        this.context.lineTo(hw.x, hw.y); // draw to half width, bottom

        // finish the path and draw it
        this.context.closePath();
        this.context.stroke();
    }

    private stateChange(timeDelta: DOMHighResTimeStamp) {
        let paddleDelta = this.mouseHandler.clear() * PADDLE_SENSITIVITY;

        this.ball(timeDelta, paddleDelta);
        this.paddles(paddleDelta);
    }

    private paddles(paddleDelta: DOMHighResTimeStamp) {
        // TODO: lerp leftpos.y with ballpos.y with a clamped movement speed
        this.gameState.leftPos.y = clamp(0, this.gameState.ballPos.y-PADDLE_HEIGHT/1.75, 100 - PADDLE_HEIGHT/this.yLim);
        this.gameState.rightPos.y = clamp(0, paddleDelta + this.gameState.rightPos.y, 100 - PADDLE_HEIGHT/this.yLim);

        let [lpx, lpy] = this.gameState.leftPos;
        let [rpx, rpy] = this.gameState.rightPos;
        let [w, h] = [1, PADDLE_HEIGHT];

        this.context.fillRect(lpx, lpy*this.yLim, w, h);
        this.context.fillRect(rpx, rpy*this.yLim, w, h);
    }

    scored: boolean = false;

    private async ballScored() {
        let oldY = this.gameState.ballPos.y;
        let before = this.gameState.ballVector.normalize();

        this.gameState.ballVector = new Coord(0,0);

        (new Promise(resolve => setTimeout(resolve, 2000))).then(() => {
            this.ballResume(oldY, before);
        });
    }

    private ballResume(oldY: number, before: Coord) {
        // reset frame time calculation - we just waited 2 seconds, that'd be a BIG simulation frame
        requestAnimationFrame(() => null);

        this.gameState.ballPos.x = 50 + 1 * -Math.sign(this.gameState.ballVector.x);
        this.gameState.ballPos.y = oldY;
        this.gameState.ballVector = before;

        this.scored = false;

        if(this.gameState.leftScore > 10 || this.gameState.rightScore > 10) {
            this.gameState.reset();
        }
    }

    private boundsCheck(nextPos: Coord): void {
        if(nextPos.y > 99 || nextPos.y < 0) {
            this.gameState.ballVector = this.gameState.ballVector.multiply(new Coord(1, -1));

            if(this.gameState.ballPos.y > 98) {
                this.gameState.ballPos.y = 99 - (this.gameState.ballPos.y - 100) - 2;
            }
        }

        if(this.gameState.ballPos.x < 0 || this.gameState.ballPos.x > 100) {
            this.scored = true;

            if(this.gameState.ballPos.x < 0) {
                this.gameState.rightScore += 1;
            }

            if(this.gameState.ballPos.x > 100) {
                this.gameState.leftScore += 1;
            }

            this.ballScored();
        }
    }

    private ball(
            timeDelta: DOMHighResTimeStamp,
            paddleDelta: number) {

        let target = {} as Coord;
        if(!this.scored) {
            let target = this.gameState.ballPos.add(
                this.gameState.ballVector.scale(
                    BASE_BALL_SPEED/1000*timeDelta));
            this.boundsCheck(target);
            this.gameState.ballPos.x = target.x;
            this.gameState.ballPos.y = target.y;
        }

        let dim = new Coord(1, 1);
        this.context.fillRect( this.gameState.ballPos.x,  this.gameState.ballPos.y*this.yLim, dim.x, dim.y);
    }

    private score() {
        const digit_offset = 4;

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
        if(isNaN(this.lastFrame)) this.lastFrame = elapsed;
        this.context.clearRect(0, 0, 100, 100);

        this.stateChange(elapsed-this.lastFrame);
        this.score();

        // draw the center court line. passing context so we don't need to put null guards everywhere
        this.midpoint_line();
        this.lastFrame = elapsed;
    }
}
