import {createURL} from '@splunk/splunk-utils/url';
import {app} from '@splunk/splunk-utils/config';

export const VIEW_INDICATORS_PAGE = createURL(`/app/${app}/indicators`);
