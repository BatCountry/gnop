export class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public cross_product(other: Coord): number {
        return this.x * other.y - this.y * other.x;
    }

    public multiply(other: Coord): Coord {
        let outCoord = new Coord(this.x, this.y);
        outCoord.x *= other.x;
        outCoord.y *= other.y;
        return outCoord;
    }

    public divide(other: Coord): Coord {
        let outCoord = new Coord(this.x, this.y);
        outCoord.x /= other.x || 1;
        outCoord.y /= other.y || 1;
        return outCoord;
    }

    public scale(value: number): Coord {
        let outCoord = new Coord(this.x, this.y);
        outCoord.x *= value;
        outCoord.y *= value;
        return outCoord;
    }

    public add(other: Coord) {
        let outCoord = new Coord(this.x, this.y);
        outCoord.x += other.x;
        outCoord.y += other.y;
        return outCoord;
    }

    public subtract(other: Coord) {
        let outCoord = new Coord(this.x, this.y);
        outCoord.x -= other.x;
        outCoord.y -= other.y;
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

    public *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
    }
}
