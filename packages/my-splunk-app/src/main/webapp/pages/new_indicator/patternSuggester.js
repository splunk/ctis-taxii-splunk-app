import {getStixPatternSuggestion} from "@splunk/my-react-component/src/ApiClient";

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
