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
    for (var key in data){
        context[key] = data[key];
    }
}

export const packData = (context) => {
    let data = {}
    for (var key in context){
        data[key] = context[key];
    }
    return(data);
}
