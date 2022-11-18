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
        let paddleDelta = new Coord(0, this.mouseHandler.clear() * PADDLE_SENSITIVITY);

        this.ball(timeDelta, paddleDelta);
        this.paddles(paddleDelta);
    }

    private nearZero(value: number): boolean {
        // round to nearest thousandth, then compare to zero
        return (Math.round(value * 1000) / 1000) == 0;
    }

    private findIntersection(ballVector: Coord, ballStart: Coord, colliderVector: Coord, colliderStart: Coord): Coord | null {
        // pad width
        let addX = 0;
        let addY = 0;

        if(ballVector.x > 0) addX = 1;
        if(ballVector.y > 0) addY = 1;

        // add ball size padding if we're moving down and/or right
        ballStart = ballStart.add(new Coord(addX, addY));

        var startDifference = ballStart.subtract(colliderStart);

        var vectorsCross = ballVector.cross_product(colliderVector);
        var crossBallVector = startDifference.cross_product(ballVector);

        // not checking for colinearity, as we're clamping ballVector.x between 0.01 and 3
        if (!this.nearZero(vectorsCross)) {
            var t = startDifference.cross_product(ballVector)/vectorsCross;
            var u = crossBallVector/vectorsCross;

            // 4. If r x s != 0 and 0 <= t <= 1 and 0 <= u <= 1
            // the two line segments meet at the point p + t r = q + u s.
            if (!this.nearZero(vectorsCross) && (0 <= t && t <= 1) && (0 <= u && u <= 1))
            {
                // We can calculate the intersection point using either t or u.
                return ballStart.add(ballVector.multiply(new Coord(t, t)));
            }
        }

        return null;
    }

    private paddles(paddleDelta: Coord) {
        // TODO: lerp leftpos.y with ballpos.y with a clamped movement speed
        this.gameState.leftPos.y = clamp(0, this.gameState.ballPos.y-PADDLE_HEIGHT/1.75, 100 - PADDLE_HEIGHT/this.yLim);
        this.gameState.rightPos.y = clamp(0, paddleDelta.y + this.gameState.rightPos.y, 100 - PADDLE_HEIGHT/this.yLim);

        let [lpx, lpy] = this.gameState.leftPos;
        let [rpx, rpy] = this.gameState.rightPos;
        let [w, h] = [1, PADDLE_HEIGHT];

        // TODO: make this sane - right now we're just drawing a line segment where the paddle started, not where it will be
        this.gameState.leftVector = new Coord(0, PADDLE_HEIGHT);
        this.gameState.rightVector = new Coord(0, PADDLE_HEIGHT);

        this.context.fillRect(lpx, lpy*this.yLim, w, h);
        this.context.fillRect(rpx, rpy*this.yLim, w, h);
    }

    private topMargin(): [Coord, Coord] {
        return [new Coord(100, 0), new Coord(0, 0)];
    }

    private bottomMargin(): [Coord, Coord] {
        return [new Coord(100, 0), new Coord(0, 100)];
    }

    private leftMargin(): [Coord, Coord] {
        return [new Coord(0, 100), new Coord(0, 0)];
    }

    private rightMargin(): [Coord, Coord] {
        return [new Coord(0, 100), new Coord(100, 0)];
    }

    private bounce(target: Coord, intersection: Coord, timeDelta: DOMHighResTimeStamp): DOMHighResTimeStamp {
        timeDelta *= target.subtract(intersection).magnitude();
        return timeDelta;
    }

    private bounceY(target: Coord, intersection: Coord, timeDelta: DOMHighResTimeStamp): DOMHighResTimeStamp {
        // bounce
        this.gameState.ballVector.y *= -1;
        return this.bounce(target, intersection, timeDelta);
    }

    private bounceX(target: Coord, intersection: Coord, timeDelta: DOMHighResTimeStamp): DOMHighResTimeStamp {
        // bounce
        this.gameState.ballVector.x *= -1;
        return this.bounce(target, intersection, timeDelta);
    }

    private doBallCollisions(timeDelta: DOMHighResTimeStamp, paddleDelta: Coord): Coord {
        let target = this.gameState.ballPos.add(
            this.gameState.ballVector.scale(
                BASE_BALL_SPEED/1000*timeDelta));

        let bv = this.gameState.ballVector;
        let bp = this.gameState.ballPos;

        let ti = this.findIntersection(bv, bp, ...this.topMargin());
        let bi = this.findIntersection(bv, bp, ...this.topMargin());

        if(ti || bi) {
            timeDelta = this.bounceY(
                target,
                // this is totally unnecessary safeguard, but typescript is not smart
                ti != null ? ti : (bi || {} as Coord),
                timeDelta);
            if(!this.nearZero(timeDelta)) {
                return this.doBallCollisions(timeDelta, paddleDelta);
            }
        }

        let lpi = this.findIntersection(bv, bp, this.gameState.leftVector, this.gameState.leftPos);
        let rpi = this.findIntersection(bv, bp, paddleDelta, this.gameState.leftPos);

        if(lpi || rpi) {
            timeDelta = this.bounceX(
                target,
                lpi != null ? lpi : (rpi || {} as Coord),
                timeDelta);
                if(!this.nearZero(timeDelta)) {
                    return this.doBallCollisions(timeDelta, paddleDelta);
                }
        }

        return target;
    }

    private ball(
            timeDelta: DOMHighResTimeStamp,
            paddleDelta: Coord) {
        // we don't want it ever going too close to vertical, or too fast
        if(this.gameState.ballVector.x < 0) this.gameState.ballVector.x = clamp(-0.01, this.gameState.ballVector.x, -3);
        if(this.gameState.ballVector.x > 0) this.gameState.ballVector.x = clamp(0.01, this.gameState.ballVector.x, 3);
        // we don't care if it's horizontal, just not too fast
        if(this.gameState.ballVector.y < 0) this.gameState.ballVector.y = clamp(0, this.gameState.ballVector.y, -3);
        if(this.gameState.ballVector.y > 0) this.gameState.ballVector.y = clamp(0, this.gameState.ballVector.y, 3);

        let target = {} as Coord;

        if(!this.scored) {
            target = this.doBallCollisions(timeDelta, paddleDelta);
            this.gameState.ballPos.x = target.x;
            this.gameState.ballPos.y = target.y;
        }

        let dim = new Coord(1, 1);
        this.context.fillRect( this.gameState.ballPos.x,  this.gameState.ballPos.y*this.yLim, dim.x, dim.y);
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
