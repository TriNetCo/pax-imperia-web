export const getRandomNum = (min, max, decimals = null) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    let randNum = Math.random() * (max - min) + min;
    let roundNum = roundToDecimal(randNum, decimals)
    return roundNum
}

export const roundToDecimal = (num, decimals = null) => {
    if (decimals == null) {
        return num
    } else {
        let multiplier = Math.pow(10, decimals);
        let roundNum = Math.round((num + Number.EPSILON) * multiplier) / multiplier;
        return roundNum
    }
}
