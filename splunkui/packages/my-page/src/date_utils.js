import moment from 'moment/moment';

export const dateNowInSecondsPrecision = () => {
    const now = new Date();
    now.setMilliseconds(0);
    return now;
}
export const dateToIsoStringWithoutTimezone = (date) => {
    return date.toISOString().slice(0, -1);
}

export const reduceIsoStringPrecisionToMilliseconds = (dateIsoString) => {
    // Native input type="datetime-local" control supports up to milliseconds (3 decimal places).
    // The backend should technically truncate any subseconds to at most 3 decimal places.
    const m = moment.utc(dateIsoString);
    return m.format("YYYY-MM-DDTHH:mm:ss.SSS");
}

export const utcNowIsoStringWithoutTimezone = () => {
    return dateToIsoStringWithoutTimezone(dateNowInSecondsPrecision());
}

export const formatTimestampForDisplay = (timestampIsoString) => {
    if(!timestampIsoString || timestampIsoString === "") {
        return "No Value";
    }
    const timestampFormatted = moment.utc(timestampIsoString).format("YYYY-MM-DD HH:mm:ss.SSS");
    const fromNow = moment.utc(timestampIsoString).fromNow();
    return `${timestampFormatted} (${fromNow})`;
}
