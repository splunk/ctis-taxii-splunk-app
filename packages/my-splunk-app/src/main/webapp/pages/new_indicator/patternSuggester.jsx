import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {errorToText, getStixPatternSuggestion} from "@splunk/my-react-component/src/ApiClient";
import {useDebounce} from "@splunk/my-react-component/src/debounce";
import {useFieldWatchesStateValue} from "../../common/utils";
import {StixPatternField} from "../../common/indicator_form/formControls";

export const usePatternSuggester = (indicatorCategory, indicatorValue) => {
    const [suggestedPattern, setSuggestedPattern] = useState(null);
    const [error, setError] = useState(null);
    const debounceIndicatorValue = useDebounce(indicatorValue, 200);
    useEffect(() => {
        if (!!indicatorCategory && !!debounceIndicatorValue) {
            getStixPatternSuggestion(indicatorCategory, debounceIndicatorValue, (resp) => {
                console.log("Pattern Suggestion response:", resp);
                setSuggestedPattern(resp?.pattern);
                setError(null);
            }, async (errorResp) => {
                const errorText = await errorToText(errorResp);
                console.error(errorResp, errorText);
                setError(errorText);
                setSuggestedPattern("...");
            }).then();
        } else {
            setSuggestedPattern(null);
        }
    }, [indicatorCategory, debounceIndicatorValue]);
    return {suggestedPattern, error};
}

export const PatternSuggester = ({indicatorCategory, indicatorValue, stixPatternFieldName, ...props}) => {
    const {suggestedPattern, error} = usePatternSuggester(indicatorCategory, indicatorValue);
    useFieldWatchesStateValue({fieldName: stixPatternFieldName, stateValue: suggestedPattern});
    return <StixPatternField {...props} suggestedPattern={suggestedPattern} fieldName={stixPatternFieldName} patternApiError={error}/>;
}

PatternSuggester.propTypes = {
    indicatorCategory: PropTypes.string,
    indicatorValue: PropTypes.string,
    stixPatternFieldName: PropTypes.string
}

