import { PADDLE_HEIGHT, PADDLE_SENSITIVITY, BASE_BALL_SPEED, MAXFPS } from "./constants";
import { GameState } from "./gamestate";
import { MouseWheel } from "./mouse";

import { digit } from "./digits";
import { clamp, findIntersection, nearZero } from "./math";
import { Coord } from "./coord";


export class Playfield {
    public context: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
    public gameState: GameState = new GameState();
    public mouseHandler: MouseWheel = new MouseWheel();
    public lastFrame: number = NaN;

    yLim: number = 1;

    public attachCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        canvas.addEventListener('wheel', (ev) => this.mouseHandler.wheelHandler(ev) );
        canvas.addEventListener('click', this.mouseHandler.createClickHandler(this.gameState) );
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
        this.gameState.rightVector = new Coord(0, this.mouseHandler.clear() * PADDLE_SENSITIVITY);

        this.doSimulationStep(timeDelta);
        this.drawBall();
        this.drawPaddles();
    }

    private bounce(origin: Coord, target: Coord, intersection: Coord, timeDelta: DOMHighResTimeStamp): DOMHighResTimeStamp {
        timeDelta *= intersection.subtract(target).magnitude()/target.subtract(origin).magnitude();
        return timeDelta;
    }

    private bounceY(origin: Coord, target: Coord, intersection: Coord, timeDelta: DOMHighResTimeStamp): DOMHighResTimeStamp {
        // bounce
        this.gameState.ballVector.y *= -1;
        return this.bounce(origin, target, intersection, timeDelta);
    }

    private bounceX(origin: Coord, target: Coord, intersection: Coord, timeDelta: DOMHighResTimeStamp): DOMHighResTimeStamp {
        // bounce
        this.gameState.ballVector.x *= -1;
        return this.bounce(origin, target, intersection, timeDelta);
    }

    private simStepHelper(timeDelta: DOMHighResTimeStamp): Coord {
        let ballTarget = this.gameState.ballPos.add(
            this.gameState.ballVector.scale(
                BASE_BALL_SPEED/1000*timeDelta));
        // TODO: lerp leftpos.y with ballpos.y with a clamped movement speed
        // TODO: paddle target vector needs to be scaled just like the ballvector
        let leftTarget = new Coord(
            this.gameState.leftPos.x,
            clamp(
                0,
                this.gameState.ballPos.y-PADDLE_HEIGHT/1.75,
                100 - PADDLE_HEIGHT/this.yLim));
        let rightTarget = new Coord(
            this.gameState.rightPos.x,
            clamp(
                0,
                this.gameState.rightVector.y + this.gameState.rightPos.y,
                100 - PADDLE_HEIGHT/this.yLim));

        let bv = this.gameState.ballVector;
        let bp = this.gameState.ballPos;

        // will collide with top margin this frame
        if(bv.y < 0 && bp.y < -bv.y) {
            let bi = findIntersection(bv, bp, ...this.topMargin());
            if(bi) {
                timeDelta = this.bounceY(
                    this.gameState.ballPos,
                    ballTarget, bi, timeDelta);
                this.gameState.ballPos = bi;
                if(!nearZero(timeDelta)) {
                    return this.simStepHelper(timeDelta);
                }
            }
        }

        // will collide with bottom margin this frame
        if(bv.y > 0 && bp.y > 99-bv.y) {
            let bi = findIntersection(bv, bp, ...this.bottomMargin());
            if(bi) {
                timeDelta = this.bounceY(
                    this.gameState.ballPos,
                    ballTarget, bi, timeDelta);
                this.gameState.ballPos = bi;
                if(!nearZero(timeDelta)) {
                    return this.simStepHelper(timeDelta);
                }
            }
        }

        // examine whether we collide with a paddle this frame
        // TODO: add a check to find out if the time position of the intersection allows the paddle to intersect
        // something like find when the two possible vectors intersect, then translate the paddle to where it will be at that time
        // then create a line segment for the paddle size starting at that position, then redo the collision
        let lpi = findIntersection(ballTarget, bp, leftTarget, this.gameState.leftPos);
        let rpi = findIntersection(ballTarget, bp, rightTarget, this.gameState.rightPos);

        if(lpi || rpi) {
            let bi = lpi != null ? lpi : (rpi || {} as Coord);
            timeDelta = this.bounceX(
                this.gameState.ballPos,
                ballTarget,
                bi,
                timeDelta);
                this.gameState.ballPos = bi;
                if(!nearZero(timeDelta)) {
                    return this.simStepHelper(timeDelta);
                }
        }

        // will score on left this frame
        if(bv.x > 0 && bp.x > 99-bv.x) {
            let bi = findIntersection(bv, bp, ...this.leftMargin());
            if(bi) {
                this.scored = true;
                this.gameState.rightScore += 1;
                this.gameState.ballPos = bi;
                this.ballScored().then();
                return this.gameState.ballPos;
            }
        }

        // will score on right this frame
        if(bv.x < 0 && bp.x > 99-bv.x) {
            let bi = findIntersection(bv, bp, ...this.rightMargin());
            if(bi) {
                this.scored = true;
                this.gameState.leftScore += 1;
                this.gameState.ballPos = bi;
                this.ballScored().then();
                return this.gameState.ballPos;
            }
        }

        return ballTarget;
    }

    private doSimulationStep(timeDelta: DOMHighResTimeStamp) {
        // we don't want it ever going too close to vertical, or too fast
        if(this.gameState.ballVector.x < 0) this.gameState.ballVector.x = clamp(-0.01, this.gameState.ballVector.x, -3);
        if(this.gameState.ballVector.x > 0) this.gameState.ballVector.x = clamp(0.01, this.gameState.ballVector.x, 3);
        // we don't care if it's horizontal, just not too fast
        if(this.gameState.ballVector.y < 0) this.gameState.ballVector.y = clamp(0, this.gameState.ballVector.y, -3);
        if(this.gameState.ballVector.y > 0) this.gameState.ballVector.y = clamp(0, this.gameState.ballVector.y, 3);

        if(!this.scored) {
            this.gameState.ballPos = this.simStepHelper(timeDelta);
        }
    }

    scored: boolean = false;

    // post-scoring pause
    private async ballScored(): Promise<void> {
        let oldY = this.gameState.ballPos.y;
        let before = this.gameState.ballVector.normalize();

        this.gameState.ballVector = new Coord(0,0);

        (new Promise(resolve => setTimeout(resolve, 2000))).then(() => {
            this.ballResume(oldY, before);
        });
    }

    // once we're done with the post-scoring pause
    private ballResume(oldY: number, before: Coord): void {
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

    private drawScore(): void {
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

    private drawBall(): void {
        let dim = new Coord(1, 1);
        this.context.fillRect( this.gameState.ballPos.x,  this.gameState.ballPos.y*this.yLim, dim.x, dim.y);
    }

    private drawPaddles(): void {
        let [lpx, lpy] = this.gameState.leftPos;
        let [rpx, rpy] = this.gameState.rightPos;
        let [w, h] = [1, PADDLE_HEIGHT];

        this.context.fillRect(lpx, lpy*this.yLim, -w, h);
        this.context.fillRect(rpx, rpy*this.yLim, w, h);
    }

    public frame(elapsed: DOMHighResTimeStamp): void {
        if(isNaN(this.lastFrame)) this.lastFrame = elapsed;
        this.context.clearRect(0, 0, 100, 100);

        this.stateChange(elapsed-this.lastFrame);
        this.drawScore();

        // draw the center court line. passing context so we don't need to put null guards everywhere
        this.midpoint_line();
        this.lastFrame = elapsed;
    }

    private topMargin = (): [Coord, Coord] => [new Coord(100, 0), new Coord(0, 0)];
    private bottomMargin = (): [Coord, Coord] => [new Coord(100, 98), new Coord(0, 98)];
    private leftMargin = (): [Coord, Coord] => [new Coord(0, 100), new Coord(0, 0)];
    private rightMargin = (): [Coord, Coord] => [new Coord(98, 100), new Coord(98, 0)];
}
