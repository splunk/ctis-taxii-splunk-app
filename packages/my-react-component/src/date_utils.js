export const dateNowInSecondsPrecision = () => {
    const now = new Date();
    now.setMilliseconds(0);
    return now;
}
export const dateToIsoStringWithoutTimezone = (date) => {
    return date.toISOString().slice(0, -1);
}

export const reduceIsoStringPrecisionToSeconds = (dateIsoString) => {
    let dateString = dateIsoString;
    // Add back on UTC timezone if it was removed
    if (!dateString.endsWith("Z")) {
        dateString += "Z";
    }
    const date = new Date(dateString);
    date.setMilliseconds(0);
    return dateToIsoStringWithoutTimezone(date);
}
