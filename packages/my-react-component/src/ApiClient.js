import {createRESTURL} from '@splunk/splunk-utils/url';
import {app, getCSRFToken} from '@splunk/splunk-utils/config';

function postData(endpoint, data, successHandler, errorHandler) {
    // Custom CSRF headers set for POST requests to custom endpoints
    // See https://docs.splunk.com/Documentation/StreamApp/7.1.3/DeployStreamApp/SplunkAppforStreamRESTAPI
    fetch(createRESTURL(endpoint, {app}),
        {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'X-Splunk-Form-Key': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
        .then(resp => {
            if (!resp.ok) {
                errorHandler(resp);
            } else {
                resp.json().then(successHandler);
            }
        })
        .catch(errorHandler)
}

export function getStixPatternSuggestion(splunkFieldName, splunkFieldValue, successHandler, errorHandler) {
    const endpoint = `suggest-stix-pattern`;
    const payload = {
        splunk_field_name: splunkFieldName,
        splunk_field_value: splunkFieldValue
    }
    postData(endpoint, payload, (resp) => {
        console.log(resp);
        successHandler(resp);
    }, errorHandler);

}

export function postCreateIndicator(data, successHandler, errorHandler) {
    postData('create-indicator', data, successHandler, errorHandler)
}
