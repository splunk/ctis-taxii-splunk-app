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
                return Promise.reject(resp);
            } else {
                return resp.json();
            }
        })
        .then(successHandler)
        .catch(errorHandler);
}

export function getData({endpoint, queryParams, query, successHandler, errorHandler}) {
    const url = createRESTURL(endpoint, {app});
    let allQueryParams = {};
    if (queryParams) {
        allQueryParams = {...queryParams};
    }
    if (query) {
        allQueryParams.query = JSON.stringify(query);
    }

    const urlSearchParams = new URLSearchParams(allQueryParams);
    const finalUrl = `${url}?${urlSearchParams.toString()}`;
    console.log('GET:', finalUrl);
    return fetch(finalUrl,
        {
            method: 'GET',
            headers: {}
        })
        .then(resp => {
            if (!resp.ok) {
                return Promise.reject(resp);
            } else {
                return resp.json();
            }
        })
        .then(successHandler)
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

export function submitGrouping(data, successHandler, errorHandler) {
    return postData('submit-grouping', data, successHandler, errorHandler)
}

export function postCreateIndicator(data, successHandler, errorHandler) {
    return postData('create-indicator', data, successHandler, errorHandler)
}

export function postCreateIdentity(data, successHandler, errorHandler) {
    return postData('create-identity', data, successHandler, errorHandler)
}

export function postCreateGrouping(data, successHandler, errorHandler) {
    return postData('create-grouping', data, successHandler, errorHandler)
}

export function editIdentity(data, successHandler, errorHandler) {
    return postData('edit-identity', data, successHandler, errorHandler)
}

export function editGrouping(data, successHandler, errorHandler) {
    return postData('edit-grouping', data, successHandler, errorHandler)
}

export function editIndicator(data, successHandler, errorHandler) {
    return postData('edit-indicator', data, successHandler, errorHandler)
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

export function deleteGrouping({groupingId, successHandler, errorHandler}) {
    console.log('Deleting grouping:', groupingId);
    return deleteData({
        endpoint: 'delete-grouping',
        data: {grouping_id: groupingId},
        successHandler,
        errorHandler
    })
}

export function deleteIndicator({indicatorId, successHandler, errorHandler}) {
    console.log('Deleting indicator:', indicatorId);
    return deleteData({
        endpoint: 'delete-indicator',
        data: {indicator_id: indicatorId},
        successHandler,
        errorHandler
    })
}

export function getIndicators({skip, limit, successHandler, errorHandler, query}) {
    return getData({
        endpoint: 'list-indicators',
        queryParams: {
            skip, limit
        }, query, successHandler, errorHandler
    })
}

export function getGroupings({skip, limit, successHandler, errorHandler, query}) {
    return getData({
        endpoint: 'list-groupings',
        queryParams: {
            skip, limit
        },
        query, successHandler, errorHandler
    })
}

export function getIdentities({skip, limit, successHandler, errorHandler, query}) {
    return getData({
        endpoint: 'list-identities',
        queryParams: {
            skip, limit
        },
        query, successHandler, errorHandler
    })
}

export function getSubmissions({skip, limit, successHandler, errorHandler, query}) {
    return getData({
        endpoint: 'list-submissions',
        queryParams: {
            skip, limit
        },
        query, successHandler, errorHandler
    })
}

export function getTaxiiConfigs({successHandler, errorHandler}) {
    return getData({
        endpoint: 'TA_CTIS_TAXII_taxii_config',
        queryParams: {
            output_mode: 'json',
            count: -1
        },
        successHandler, errorHandler
    })
}

export function getStixBundleForGrouping({groupingId, successHandler, errorHandler}) {
    return getData({
        endpoint: 'get-stix-bundle-for-grouping',
        queryParams: {
            grouping_id: groupingId
        },
        successHandler, errorHandler
    })
}

export function listTaxiiCollections({taxiiConfigName, successHandler, errorHandler}) {
    return getData({
        endpoint: 'list-taxii-collections',
        queryParams: {
            config_name: taxiiConfigName
        },
        successHandler, errorHandler
    })
}

async function getAllRecords(endpoint, successHandler, errorHandler) {
    const allRecords = [];
    const pageSize = 100;
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
        await getData({
            endpoint,
            queryParams: {
                skip: offset,
                limit: pageSize
            },
            successHandler: (resp) => {
                allRecords.push(...resp.records);
                offset += pageSize;
                if (resp.records.length < pageSize) {
                    hasMore = false;
                }
            },
            errorHandler
        });
    }
    successHandler(allRecords);
}

export async function getAllGroupings(successHandler, errorHandler) {
    return getAllRecords('list-groupings', successHandler, errorHandler);
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
        },
        successHandler: (resp) => {
            // Assumption that JSON response will have a top-level array called "records"
            if (resp.records.length === 1) {
                successHandler(resp.records[0]);
            } else if (resp.records.length === 0) {
                errorHandler(new Error(`No records found for query: ${JSON.stringify(query)}`));
            } else {
                errorHandler(new Error(`Unexpected response: ${JSON.stringify(query)}`));
            }
        }, errorHandler
    })
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
            errorHandler: async (error) => {
                if(error instanceof Response){
                    const error_text = await error.text()
                    setError(error_text);
                    console.error(error_text, error);
                }else{
                    setError(String(error));
                    console.error(error);
                }
                setLoading(false);
            }
        });
    }, []);
    return {record, loading, error};
}

export function getIndicator({indicatorId, successHandler, errorHandler}) {
    return getExactlyOneRecord({
        query: {
            "indicator_id": indicatorId
        },
        endpoint: 'list-indicators',
        successHandler,
        errorHandler
    })
}

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

export function getGrouping({groupingId, successHandler, errorHandler}) {
    return getExactlyOneRecord({
        query: {
            "grouping_id": groupingId
        },
        endpoint: 'list-groupings',
        successHandler,
        errorHandler
    })
}

export function getSubmission({submissionId, successHandler, errorHandler}) {
    return getExactlyOneRecord({
        query: {
            "submission_id": submissionId
        },
        endpoint: 'list-submissions',
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
        successHandler, errorHandler
    })
}
