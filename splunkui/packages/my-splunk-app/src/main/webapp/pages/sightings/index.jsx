import React from 'react';
import { AppContainer } from '@splunk/my-page/src/AppContainer';
import Loader from '@splunk/my-page/src/Loader';
import {useAdvancedSettings} from '@splunk/my-page/src/hooks/useAdvancedSettings';
import Layout from '@splunk/react-ui/Layout';
import Message from '@splunk/react-ui/Message';
import { layoutWithTheme } from '../../common/theme';
import { getUrlQueryParams } from '../../common/queryParams';
import ListSightings from './ListSightings';
import CreateSighting from './CreateSighting';
import EditSighting from './EditSighting';

function WarningSightingsFeatureDisabled(){
    return (<Layout>
        <Message appearance='fill' type='warning'>
            <strong>Sightings Feature is not enabled.</strong>
            <br />
            If you would like to enable this feature navigate to Configuration &gt; Advanced Settings.
            Then check the &#39;Enable Sightings Feature&#39; checkbox, and click the Save button.
        </Message>
    </Layout>);
}

function Router() {
    const {loading, error, advancedSettings} = useAdvancedSettings();
    const queryParams = getUrlQueryParams();
    const sightingId = queryParams.get('sighting_id')
    let component = <ListSightings />;

    if (!advancedSettings.enableSightings){
        component = <WarningSightingsFeatureDisabled />;
    }else if (queryParams.has('action', 'create')) {
        component = <CreateSighting />;
    }else if(queryParams.has('action', 'edit')){
        component = <EditSighting sightingId={sightingId} />;
    }
    return (<Loader loading={loading} error={error}>
        {component}
    </Loader>)
}

layoutWithTheme(
    <AppContainer>
        <Router />
    </AppContainer>,
);
