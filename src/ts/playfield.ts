import { GameState, PADDLE_HEIGHT } from "./gamestate";
import { digit } from "./digits";


export class Playfield {
    public gameState: GameState = new GameState();


    private midpoint_line(ctx: CanvasRenderingContext2D) {
        let hw = 50; // left position is half court width
        let h = 100; // height of canvas

        ctx.clearRect(49, 0, 2, 100);

        ctx.beginPath(); // we're drawing a line from h=0 to h=100%

        ctx.setLineDash([1, 2.25]);

        ctx.moveTo(hw, 0); // start at half width, top
        ctx.lineTo(hw, h); // draw to half width, bottom

        // finish the path and draw it
        ctx.closePath();
        ctx.stroke();
    }

    private paddles(ctx: CanvasRenderingContext2D) {
        // wipe the paddle row clear
        ctx.clearRect(0,0,1,100);
        ctx.clearRect(99,0,1,100);

        ctx.fillRect(
            this.gameState.leftPos.x,
            this.gameState.leftPos.y,
            1, PADDLE_HEIGHT);

        ctx.fillRect(
            this.gameState.rightPos.x,
            this.gameState.rightPos.y,
            1, PADDLE_HEIGHT);
    }

    private score(ctx: CanvasRenderingContext2D) {
        const digit_offset = 4;
        ctx.clearRect(0, 0, 100, 10);

        let s = '' + this.gameState.leftScore;
        let left = 50 - digit_offset;
        while(s != '') {
            digit(ctx, s.slice(-1), left);
            left -= digit_offset;
            s = s.slice(0,-1);
        }

        s = '' + this.gameState.rightScore;
        left = 51;
        while(s != '') {
            digit(ctx, s.slice(0, 1), left);
            left += digit_offset;
            s = s.slice(1);
        }
    }

    public frame(ctx: CanvasRenderingContext2D, elapsed: DOMHighResTimeStamp): void {
        this.score(ctx);
        this.paddles(ctx);

        // TODO: simulate and draw the ball


        // draw the center court line. passing context so we don't need to put null guards everywhere
        this.midpoint_line(ctx);
    }

    public frameCallback(ctx: CanvasRenderingContext2D) {
        this.frame.bind(this);
        return (elapsed: DOMHighResTimeStamp) => {
            this.frame(ctx, elapsed);
        }
    }
}
