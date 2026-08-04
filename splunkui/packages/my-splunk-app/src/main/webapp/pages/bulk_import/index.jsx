import React from 'react';
import { AppContainer } from '@splunk/my-page/src/AppContainer';
import Message from '@splunk/react-ui/Message';
import { getUrlQueryParams } from '@splunk/my-page/src/queryParams';
import { layoutWithTheme } from '../../common/theme';
import ImportIndicatorsPage from './ImportIndicatorsPage';
import ImportIdentitiesPage from './ImportIndentitiesPage';



function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('model', 'indicator')) {
        return <ImportIndicatorsPage />;
    }
    if (queryParams.has('model', 'identity')) {
        return <ImportIdentitiesPage />;
    }
    return (<Message>Bulk Import Page - expected model query param.</Message>);
}

layoutWithTheme(
    <AppContainer>
        <Router />
    </AppContainer>
);
