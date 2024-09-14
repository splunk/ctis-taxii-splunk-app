import {createURL} from '@splunk/splunk-utils/url';
import {app} from '@splunk/splunk-utils/config';

export const VIEW_INDICATORS_PAGE = createURL(`/app/${app}/indicators`);
export const VIEW_IDENTITIES_PAGE = createURL(`/app/${app}/identities`);
export const editIdentityPage = (identityId) => createURL(`/app/${app}/identities`, {
    identity_id: identityId,
    action: 'edit',
});
