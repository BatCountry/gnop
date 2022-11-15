export class MouseWheel {
    private accumulated: number = 0;

    constructor() {
        this.accumulated = 0;
    }

    public clear(): number {
        let accumulated = this.accumulated;
        this.accumulated = 0;
        return accumulated;
    }


    public handle(ev: WheelEvent) {
        let qty = ev.deltaY / Math.abs(ev.deltaY);
        this.accumulated += ev.deltaY / Math.abs(ev.deltaY);
        console.log(this.accumulated);
    }
}
