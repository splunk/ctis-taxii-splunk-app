import React from 'react';
import { AppContainer } from '@splunk/my-page/src/AppContainer';
import { layoutWithTheme } from '../../common/theme';
import { getUrlQueryParams } from '../../common/queryParams';
import ListSightings from './ListSightings';
import CreateSighting from './CreateSighting';
import EditSighting from './EditSighting';

// TODO: Add feature flag check for enable_sightings
function Router() {
    const queryParams = getUrlQueryParams();
    const sightingId = queryParams.get('sighting_id')
    let component = <ListSightings />;
    if (queryParams.has('action', 'create')) {
        component = <CreateSighting />;
    }else if(queryParams.has('action', 'edit')){
        component = <EditSighting sightingId={sightingId} />;
    }
    return component;
}

layoutWithTheme(
    <AppContainer>
        <Router />
    </AppContainer>,
);
