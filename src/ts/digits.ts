type RectStats = [left: number, top: number, width: number, height: number];
type DigitMap = { [key: string]: RectStats[] }

const DIGITS: DigitMap = {
    '1': [[2,0,1,6]],
    '2': [[0,0,3,1], [0,2,3,1], [0,5,3,1], [2,0,1,3], [0,2,1,3]],
    '3': [[0,0,3,1], [0,2,3,1], [0,5,3,1], [2,0,1,6]],
    '4': [[0,0,1,3], [2,0,1,6], [0,2,3,1]],
    '5': [[0,0,3,1], [0,2,3,1], [0,5,3,1], [0,0,1,3], [2,2,1,4]],
    '6': [[0,0,3,1], [0,2,3,1], [0,5,3,1], [0,0,1,6], [2,2,1,4]],
    '7': [[0,0,3,1], [2,0,1,6]],
    '8': [[0,0,3,1], [0,2,3,1], [0,5,3,1], [0,0,1,6], [2,0,1,6]],
    '9': [[0,0,3,1], [0,2,3,1], [2,0,1,6], [0,0,1,3]],
    '0': [[0, 0, 1, 5], [0, 0, 3, 1], [2, 0, 1, 5], [0, 5, 3, 1]]
}

export function digit(ctx: CanvasRenderingContext2D, n: string, xOffset: number) {
    for(let i of DIGITS[n]) {
        let [sx, sy, sw, sh] = i
        let lw = ctx.lineWidth;
        ctx.lineWidth = 0;
        ctx.fillRect(xOffset + sx, 1 + sy, sw, sh);
        ctx.lineWidth = lw;
    }
}
