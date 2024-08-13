import {getStixPatternSuggestion} from "@splunk/my-react-component/src/ApiClient";

export const suggestPattern = (splunkFieldName, splunkFieldValue, setSuggestedPattern) => {
    if (!!splunkFieldName && !!splunkFieldValue) {
        getStixPatternSuggestion(splunkFieldName, splunkFieldValue, (resp) => {
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
