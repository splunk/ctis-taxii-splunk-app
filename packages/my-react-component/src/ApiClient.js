import {createRESTURL} from '@splunk/splunk-utils/url';
import {app, getCSRFToken} from '@splunk/splunk-utils/config';
import {useEffect, useState} from "react";

function postData(endpoint, data, successHandler, errorHandler) {
    return submitToEndpoint('POST', endpoint, data, successHandler, errorHandler);
}

function deleteData({endpoint, data, successHandler, errorHandler}) {
    return submitToEndpoint('DELETE', endpoint, data, successHandler, errorHandler);
}

function submitToEndpoint(method, endpoint, data, successHandler, errorHandler) {
    // Custom CSRF headers set for POST requests to custom endpoints
    // See https://docs.splunk.com/Documentation/StreamApp/7.1.3/DeployStreamApp/SplunkAppforStreamRESTAPI
    const url = createRESTURL(endpoint, {app});
    return fetch(url,
        {
            method: method,
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
    return fetch(finalUrl,
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
    return postData(endpoint, payload, (resp) => {
        console.log(resp);
        successHandler(resp);
    }, errorHandler);

}

export function postCreateIndicator(data, successHandler, errorHandler) {
    return postData('create-indicator', data, successHandler, errorHandler)
}

export function postCreateIdentity(data, successHandler, errorHandler) {
    return postData('create-identity', data, successHandler, errorHandler)
}

export function editIdentity(data, successHandler, errorHandler) {
    return postData('edit-identity', data, successHandler, errorHandler)
}

export function deleteIdentity({identityId, successHandler, errorHandler}) {
    console.log('Deleting identity:', identityId);
    return deleteData({
        endpoint: 'delete-identity',
        data: {identity_id: identityId},
        successHandler,
        errorHandler
    })
}

export function getIndicators(skip, limit, successHandler, errorHandler) {
    return getData({
        endpoint: 'list-indicators',
        queryParams: {
            skip, limit
        }
    }, successHandler, errorHandler)
}

export function getIdentities(skip, limit, successHandler, errorHandler) {
    return getData({
        endpoint: 'list-identities',
        queryParams: {
            skip, limit
        }
    }, successHandler, errorHandler)
}

export function getExactlyOneRecord({query, endpoint, successHandler, errorHandler}) {
    if (!query) {
        throw new Error('query is required');
    }
    if (!endpoint) {
        throw new Error('endpoint is required');
    }
    if (!successHandler) {
        throw new Error('successHandler is required');
    }
    if (!errorHandler) {
        throw new Error('errorHandler is required');
    }

    return getData({
        endpoint,
        queryParams: {
            query: JSON.stringify(query)
        }
    }, (resp) => {
        // Assumption that JSON response will have a top-level array called "records"
        if (resp.records.length === 1) {
            successHandler(resp.records[0]);
        } else if (resp.records.length === 0) {
            errorHandler(new Error(`No records found for query: ${JSON.stringify(query)}`));
        } else {
            errorHandler(new Error(`Unexpected response: ${JSON.stringify(query)}`));
        }
    }, errorHandler)
}

export function useGetRecord({restGetFunction, restFunctionQueryArgs}) {
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        restGetFunction({
            ...restFunctionQueryArgs,
            successHandler: (resp) => {
                console.log("Response:", resp);
                setRecord(resp);
                setLoading(false);
            },
            errorHandler: (error) => {
                setLoading(false);
                console.error(error);
                if (error instanceof Error) {
                    setError(error.toString());
                } else {
                    setError(JSON.stringify(error));
                }
            }
        });
    }, []);
    return {record, loading, error};
}

// TODO: extract and refactor this function to be more generic for reuse
export function getIdentity({identityId, successHandler, errorHandler}) {
    return getExactlyOneRecord({
        query: {
            "identity_id": identityId
        },
        endpoint: 'list-identities',
        successHandler,
        errorHandler
    })
}

export function listIndicatorCategories(splunkFieldName, indicatorValue, successHandler, errorHandler) {
    const queryParams = {};
    if (splunkFieldName) {
        queryParams.splunk_field_name = splunkFieldName;
    }
    if (indicatorValue) {
        queryParams.indicator_value = indicatorValue;
    }
    return getData({
        endpoint: 'list-ioc-categories',
        queryParams: queryParams,
    }, successHandler, errorHandler)
}
