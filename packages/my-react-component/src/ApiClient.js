import {createRESTURL} from '@splunk/splunk-utils/url';
import {app, getCSRFToken} from '@splunk/splunk-utils/config';

async function postData(endpoint, data, successHandler, errorHandler) {
    // Custom CSRF headers set for POST requests to custom endpoints
    // See https://docs.splunk.com/Documentation/StreamApp/7.1.3/DeployStreamApp/SplunkAppforStreamRESTAPI
    try {
        const resp = await fetch(createRESTURL(endpoint, {app}),
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'X-Splunk-Form-Key': getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
        successHandler(resp);
    } catch (error){
        errorHandler(error);
    }

}

export async function postCreateIndicator(data, successHandler, errorHandler) {
    await postData('create-indicator', data, successHandler, errorHandler)
}
