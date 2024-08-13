// https://stackoverflow.com/a/77124113/23523267
import {useEffect, useState} from "react";

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
