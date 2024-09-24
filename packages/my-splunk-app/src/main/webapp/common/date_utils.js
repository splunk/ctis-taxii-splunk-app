export const dateNowInSecondsPrecision = () => {
    const now = new Date();
    now.setMilliseconds(0);
    return now;
}
export const dateToIsoStringWithoutTimezone = (date) => {
    return date.toISOString().slice(0, -1);
}

export const reduceIsoStringPrecisionToSeconds = (dateIsoString) => {
    const date = new Date(dateIsoString);
    date.setMilliseconds(0);
    return dateToIsoStringWithoutTimezone(date);
}
