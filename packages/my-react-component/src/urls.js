import {createURL} from '@splunk/splunk-utils/url';
import {app} from '@splunk/splunk-utils/config';
import React from "react";

export const VIEW_INDICATORS_PAGE = createURL(`/app/${app}/indicators`);
export const NEW_INDICATOR_PAGE = createURL(`/app/${app}/new_indicator`);

export const VIEW_IDENTITIES_PAGE = createURL(`/app/${app}/identities`);
export const NEW_IDENTITY_PAGE = createURL(`/app/${app}/new_identity`);

export const VIEW_GROUPINGS_PAGE = createURL(`/app/${app}/groupings`);
export const NEW_GROUPING_PAGE = createURL(`/app/${app}/new_grouping`);

export const viewIndicator = (indicatorId) => createURL(`/app/${app}/indicators`, {
    indicator_id: indicatorId,
});

export const viewGrouping = (groupingId) => createURL(`/app/${app}/groupings`, {
    grouping_id: groupingId,
});

export const viewIdentity = (identityId) => createURL(`/app/${app}/identities`, {
    search: identityId,
});

export const urlForEditGrouping = (groupingId) => createURL(`/app/${app}/groupings`, {
    action: 'edit',
    grouping_id: groupingId,
});

export const urlForSubmitGrouping = (groupingId) => createURL(`/app/${app}/submissions`, {
    action: 'submit',
    grouping_id: groupingId,
});

export const urlForEditIndicator = (indicatorId) => createURL(`/app/${app}/indicators`, {
    action: 'edit',
    indicator_id: indicatorId,
});

export const urlForViewSubmission = (submissionId) => createURL(`/app/${app}/submissions`, {
    submission_id: submissionId,
});

export const editIdentityPage = (identityId) => createURL(`/app/${app}/identities`, {
    identity_id: identityId,
    action: 'edit',
});

export const editGroupingPage = (groupingId) => createURL(`/app/${app}/groupings`, {
    grouping_id: groupingId,
    action: 'edit',
});

export function IdentityIdLink({identityId}) {
    return (<a href={viewIdentity(identityId)}>{identityId}</a>)
}

export function GroupingIdLink({groupingId}) {
    return (<a href={viewGrouping(groupingId)}>{groupingId}</a>)
}

export function IndicatorIdLink({indicatorId}) {
    return (<a href={viewIndicator(indicatorId)}>{indicatorId}</a>)
}
