
// class to simply keep track of time based on an initial stage in time..
class TimeHandler {
    constructor(initialClockTime) {
        this.previousTime = new Date().getTime();
        this.clockTime = initialClockTime;
    }

    incrementClockTime() {
        const currentTime = new Date().getTime()
        this.clockTime += (currentTime - this.previousTime) / 1000;
        this.previousTime = currentTime;
    }

    getClockTime() {return this.clockTime;}
}

module.exports = TimeHandler;