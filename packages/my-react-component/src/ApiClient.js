import {createRESTURL} from '@splunk/splunk-utils/url';
import {app, getCSRFToken} from '@splunk/splunk-utils/config';

function postData(endpoint, data, successHandler, errorHandler) {
    // Custom CSRF headers set for POST requests to custom endpoints
    // See https://docs.splunk.com/Documentation/StreamApp/7.1.3/DeployStreamApp/SplunkAppforStreamRESTAPI
    const url = createRESTURL(endpoint, {app});
    fetch(url,
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

function getData({endpoint, queryParams}, successHandler, errorHandler) {
    const url = createRESTURL(endpoint, {app});
    let finalUrl = url;
    if (queryParams) {
        const urlSearchParams = new URLSearchParams(queryParams);
        finalUrl = `${url}?${urlSearchParams.toString()}`;
    }
    fetch(finalUrl,
        {
            method: 'GET',
            headers: {}
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

export function getStixPatternSuggestion(indicatorCategory, indicatorValue, successHandler, errorHandler) {
    const endpoint = `suggest-stix-pattern`;
    const payload = {
        indicator_value: indicatorValue,
        indicator_category: indicatorCategory,
    }
    postData(endpoint, payload, (resp) => {
        console.log(resp);
        successHandler(resp);
    }, errorHandler);

}

export function postCreateIndicator(data, successHandler, errorHandler) {
    postData('create-indicator', data, successHandler, errorHandler)
}

export function getIndicators(skip, limit, successHandler, errorHandler) {
    getData({
        endpoint: 'list-indicators',
        queryParams: {
            skip, limit
        }
    }, successHandler, errorHandler)
}

export function listIndicatorCategories(splunkFieldName, indicatorValue, successHandler, errorHandler) {
    const queryParams = {};
    if (splunkFieldName) {
        queryParams.splunk_field_name = splunkFieldName;
    }
    if (indicatorValue) {
        queryParams.indicator_value = indicatorValue;
    }
    getData({
        endpoint: 'list-ioc-categories',
        queryParams: queryParams,
    }, successHandler, errorHandler)
}
