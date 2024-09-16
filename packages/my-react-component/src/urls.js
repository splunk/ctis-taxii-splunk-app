import {createURL} from '@splunk/splunk-utils/url';
import {app} from '@splunk/splunk-utils/config';

export const VIEW_INDICATORS_PAGE = createURL(`/app/${app}/indicators`);
export const VIEW_IDENTITIES_PAGE = createURL(`/app/${app}/identities`);
export const VIEW_GROUPINGS_PAGE = createURL(`/app/${app}/groupings`);
export const editIdentityPage = (identityId) => createURL(`/app/${app}/identities`, {
    identity_id: identityId,
    action: 'edit',
});

export const editGroupingPage = (groupingId) => createURL(`/app/${app}/groupings`, {
    grouping_id: groupingId,
    action: 'edit',
});
