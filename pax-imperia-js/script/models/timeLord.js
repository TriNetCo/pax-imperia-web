
export default class TimeLord {

    constructor() {
        this.reset();
    }

    reset() {
        this.startTime = Date.now();
    }

    end(msg = '', log = true) {
        const deltaTime = Date.now() - this.startTime;
        if (log) {
            console.log(deltaTime + ' ms: ' + msg)
        }
        return deltaTime;
    }

    endAndReset(msg = '', log = true) {
        this.end(msg, log)
        this.reset();
    }
}