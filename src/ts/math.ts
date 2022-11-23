import { Coord } from "./coord";
import { PADDLE_HEIGHT } from "./constants";

export function nearZero(value: number): boolean {
    // round to nearest thousandth, then compare to zero
    return (Math.round(value * 1000) / 1000) == 0;
}

export function clamp(min: number, value: number, max: number) {
    return value < min ? min : value > max ? max : value;
}

// https://www.codeproject.com/Tips/862988/Find-the-Intersection-Point-of-Two-Line-Segments
// with modifications for paddle size and element width
export function findIntersection(p2: Coord, p: Coord, q2: Coord, q: Coord): Coord | null {
    var qsubp = q.subtract(p);

    var r = p2.subtract(p);
    var s = q2.subtract(q);

    var rxs = r.cross(s);
    var qpxr = qsubp.cross(r);

    if(nearZero(rxs) && nearZero(qpxr)) return null;

    // not checking for colinearity, as we're clamping ballVector.x between 0.01 and 3
    if (!nearZero(rxs)) {
        var t = qsubp.cross(s)/rxs;
        var u = qpxr/rxs;

        // 4. If r x s != 0 and 0 <= t <= 1 and 0 <= u <= 1
        // the two line segments meet at the point p + t r = q + u s.
        if ((0 <= t && t <= 1) && (0 <= u && u <= 1))
        {
            return p.add(r.multiply(new Coord(t, t)));
        }
    }

    return null;
}
