export class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public multiply(other: Coord): Coord {
        let outCoord = new Coord(this.x, this.y);
        outCoord.x *= other.x;
        outCoord.y *= other.y;
        return outCoord;
    }

    public normalize(): Coord {
        let outCoord = new Coord(this.x, this.y);
        let l = this.magnitude();
        outCoord.x /= l;
        outCoord.y /= l;
        return outCoord;
    }

    public magnitude(): number {
        return (this.x**2 + this.y**2)**0.5;
    }
}
