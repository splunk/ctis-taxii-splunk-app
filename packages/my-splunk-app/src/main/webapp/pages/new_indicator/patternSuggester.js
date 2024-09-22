import React, {useEffect, useState} from "react";
import {getStixPatternSuggestion} from "@splunk/my-react-component/src/ApiClient";
import {useDebounce} from "@splunk/my-react-component/src/debounce";
import {useFieldWatchesStateValue} from "../../common/utils";
import {StixPatternField} from "../../common/indicator_form/formControls";

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

export const PatternSuggester = ({indicatorCategory, indicatorValue, stixPatternFieldName}) => {
    const {suggestedPattern} = usePatternSuggester(indicatorCategory, indicatorValue);
    useFieldWatchesStateValue({fieldName: stixPatternFieldName, stateValue: suggestedPattern});
    return <StixPatternField suggestedPattern={suggestedPattern} fieldName={stixPatternFieldName}/>;
}

