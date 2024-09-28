import {useEffect, useState} from "react";

// https://stackoverflow.com/a/77124113/23523267
export const useDebounce = (cb, delay) => {
    const [debounceValue, setDebounceValue] = useState(cb);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceValue(cb);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [cb, delay]);
    return debounceValue;
}

export const useDebounceMultiple = (values, delay) => {
    const [debounceValues, setDebounceValues] = useState(values);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceValues(values);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [JSON.stringify(values), delay]);
    return debounceValues;
}
