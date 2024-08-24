import React, {useEffect, useState} from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';
import {NewIndicatorForm} from "./NewIndicatorForm";
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import Heading from "@splunk/react-ui/Heading";
import {getData} from "@splunk/splunk-utils/search";

function getUrlQueryParams() {
    return new URLSearchParams(window.location.search);
}

function parseQueryParamsSingleIndicatorMode(urlParams){
    const splunkFieldName = urlParams.get('splunkFieldName');
    const splunkFieldValue = urlParams.get('splunkFieldValue');
    return {splunkFieldName, splunkFieldValue}
}

function parseInEventMode(urlParams){
    const sid = urlParams.getAll('sid');
    const offset = urlParams.get('offset');
    return {sid, offset}
}
const useSplunkSearchResults = ({sid, offset, count}) => {
    const [splunkEvent, setSplunkEvent] = useState({});
    useEffect(() => {
        getData(sid, "results", {offset, count}).then((results) => {
            console.log(results);
            setSplunkEvent(results.results[0]);
        })
    }, []);
    return {splunkEvent}
}

function MainComponent() {
    const urlParams = getUrlQueryParams();
    let splunkFieldName, splunkFieldValue;
    let indicatorForm;
    if(urlParams.has("sid")){
        const {sid, offset} = parseInEventMode(urlParams);
        const {splunkEvent} = useSplunkSearchResults({sid, offset, count: 1});
        indicatorForm = <NewIndicatorForm event={splunkEvent} />;
    }else{
        ({splunkFieldName, splunkFieldValue} = parseQueryParamsSingleIndicatorMode(urlParams));
        indicatorForm = <NewIndicatorForm initialSplunkFieldName={splunkFieldName} initialSplunkFieldValue={splunkFieldValue} />;
    }
    return (
        <AppContainer>
            <Heading level={1}>New Indicator of Compromise (IoC)</Heading>
            {indicatorForm}
        </AppContainer>
    )
}

getUserTheme()
    .then((theme) => {
        layout(
            <MainComponent />,
            { theme, }
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
