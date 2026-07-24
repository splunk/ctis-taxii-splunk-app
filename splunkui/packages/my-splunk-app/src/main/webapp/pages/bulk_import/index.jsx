import React from 'react';
import { AppContainer } from '@splunk/my-page/src/AppContainer';
import Message from '@splunk/react-ui/Message';
import { getUrlQueryParams } from '@splunk/my-page/src/queryParams';
import { layoutWithTheme } from '../../common/theme';
import ImportIndicatorsPage from './ImportIndicatorsPage';


function BulkImportIdentities() {
    return (<Message>Bulk import identities</Message>);
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('model', 'indicator')) {
        return <ImportIndicatorsPage />;
    }
    if (queryParams.has('model', 'identity')) {
        return <BulkImportIdentities />;
    }
    return (<Message>Bulk Import Page - expected model query param.</Message>);
}

layoutWithTheme(
    <AppContainer>
        <Router />
    </AppContainer>
);
