import {createURL} from '@splunk/splunk-utils/url';
import {app} from '@splunk/splunk-utils/config';

export const VIEW_INDICATORS_PAGE = createURL(`/app/${app}/indicators`);
export const NEW_INDICATOR_PAGE = createURL(`/app/${app}/new_indicator`);

export const VIEW_IDENTITIES_PAGE = createURL(`/app/${app}/identities`);
export const NEW_IDENTITY_PAGE = createURL(`/app/${app}/new_identity`);

export const VIEW_GROUPINGS_PAGE = createURL(`/app/${app}/groupings`);
export const NEW_GROUPING_PAGE = createURL(`/app/${app}/new_grouping`);

export const viewIndicator = (indicatorId) => createURL(`/app/${app}/indicators`, {
    search: indicatorId,
});

export const editIdentityPage = (identityId) => createURL(`/app/${app}/identities`, {
    identity_id: identityId,
    action: 'edit',
});

export const editGroupingPage = (groupingId) => createURL(`/app/${app}/groupings`, {
    grouping_id: groupingId,
    action: 'edit',
});
