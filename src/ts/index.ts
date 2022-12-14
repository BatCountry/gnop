import { Playfield } from "./playfield";
import { MAXFPS } from "./constants";


function doAnimationFrame(callback: FrameRequestCallback) {
    requestAnimationFrame(callback);
    setTimeout(() => {
        doAnimationFrame(callback);
    }, 1000 / MAXFPS);
}

function waitForPlayfield(): Promise<HTMLCanvasElement> {
    const pf = '#playfield'

    return new Promise(resolve => {
        if (document.querySelector(pf)) {
            return resolve(document.querySelector(pf) as HTMLCanvasElement);
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(pf)) {
                resolve(document.querySelector(pf) as HTMLCanvasElement);
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

export default class Gnop {
    private game: Playfield = {} as Playfield;

    public doGeometry(canvas: HTMLCanvasElement, ctx?: CanvasRenderingContext2D | null): CanvasRenderingContext2D {
        // grab the rendering context if we don't have it
        while(!ctx) ctx = canvas.getContext("2d");

        // set viewport dimensions
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let bigDim = Math.max(canvas.width, canvas.height);
        this.game.yLim = canvas.height / bigDim;

        ctx.scale(bigDim / 100, bigDim / 100);

        // set some global canvas rendering style values, could probably have done this in CSS
        ctx.lineWidth = 0;
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';

        return ctx;
    }

    public run() {
        // start the frame timer
        doAnimationFrame((elapsed) => this.game.frame(elapsed));
    }

    public constructor() {
        waitForPlayfield().then(
            (canvas: HTMLCanvasElement) => {
                this.game = new Playfield();

                // fix the canvas geometry to match the window client rect
                let ctx = this.doGeometry(canvas);

                // register an onresize event for fixing the client rect if the window's resized
                this.doGeometry.bind(this);
                window.onresize = () => {
                    this.doGeometry(canvas, ctx);
                }

                this.game.attachCanvas(canvas, ctx);
            }
        );
	}
}

window.onload = () => {
	let gnop = new Gnop();
    gnop.run();
}
