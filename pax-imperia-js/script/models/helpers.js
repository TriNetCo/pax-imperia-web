// Generic helper functions

export const getRandomNum = (min, max, decimals = null) => {
    // Returns a random number between min and max, rounded to the specified
    // decimal place. If decimals is left null, does not round.
    let randNum = Math.random() * (max - min) + min;
    let roundNum = roundToDecimal(randNum, decimals)
    return roundNum
}

export const roundToDecimal = (num, decimals = null) => {
    // Rounds a number to specified decimal place. If decimals is left null,
    // does not round.
    if (decimals == null) {
        return num
    } else {
        let multiplier = Math.pow(10, decimals);
        let roundNum = Math.round((num + Number.EPSILON) * multiplier) / multiplier;
        return roundNum
    }
}

export const unpackData = (data, context) => {
    for (var key in data) {
        context[key] = data[key];
    }
}

export const packData = (context) => {
    let data = {}
    for (var key in context) {
        data[key] = context[key];
    }
    return data;
}

export class Queue extends Array {
    constructor(n, startingArray = null) {
        if (!startingArray) {
            startingArray = new Array(n).fill(null);
        } else {
            startingArray = startingArray.slice(0, n);
            const fillArray = new Array(n - startingArray.length).fill(null);
            startingArray = startingArray.concat(fillArray);
        }
        if (n > 1) {
            super(...startingArray);
        } else {
            super(n);
            this[0] = startingArray[0];
        }

    }

    push(item) {
        for (let i = this.length - 1; i >= 0; i--) {
            this[i] = this[i - 1];
        }
        this[0] = item;
    }

    clear() {
        for (let i = this.length - 1; i >= 0; i--) {
            this[i] = null;
        }
    }
}

export const getBasePath = () => {
    let path = '';
    if (typeof (window) !== 'undefined' && window.location.hash.includes("#")) {
        path = "/pax-imperia-clone";
    };
    return path;
}

export const getScaledNumber = (input, minInput, maxInput, minOutput, maxOutput) => {
    const inputPercent = (input - minInput) / (maxInput - minInput);
    const output = inputPercent * (maxOutput - minOutput) + minOutput;
    return output;
}
