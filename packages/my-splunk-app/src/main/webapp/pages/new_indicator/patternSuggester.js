import {getStixPatternSuggestion} from "@splunk/my-react-component/src/ApiClient";
import {useEffect, useState} from "react";
import {useDebounce} from "@splunk/my-react-component/src/debounce";

export const suggestPattern = (indicatorCategory, indicatorValue, setSuggestedPattern) => {
    if (!!indicatorCategory && !!indicatorValue) {
        getStixPatternSuggestion(indicatorCategory, indicatorValue, (resp) => {
            console.log("Response json:", resp);
            setSuggestedPattern(resp?.pattern);
        }, (error) => {
            console.error(error);
            setSuggestedPattern(null);
        });
    } else {
        setSuggestedPattern(null);
    }
}

export const usePatternSuggester = (indicatorCategory, indicatorValue) => {
    const [suggestedPattern, setSuggestedPattern] = useState(null);
    const debounceIndicatorValue = useDebounce(indicatorValue, 200);
    useEffect(() => {
        suggestPattern(indicatorCategory, indicatorValue, setSuggestedPattern);
    }, [indicatorCategory, debounceIndicatorValue]);
    return {suggestedPattern};
}

