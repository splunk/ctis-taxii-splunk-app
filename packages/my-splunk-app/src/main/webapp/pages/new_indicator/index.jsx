import React, {useEffect, useState} from 'react';
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import Heading from "@splunk/react-ui/Heading";
import {getData} from "@splunk/splunk-utils/search";
import P from "@splunk/react-ui/Paragraph";
import {NewIndicatorForm} from "./NewIndicatorForm";
import {layoutWithTheme} from "../../common/theme";

function getUrlQueryParams() {
    return new URLSearchParams(window.location.search);
}

function queryParamsForFieldWorkflowAction(urlParams) {
    const splunkFieldName = urlParams.get('splunkFieldName');
    const splunkFieldValue = urlParams.get('splunkFieldValue');
    return {splunkFieldName, splunkFieldValue}
}

function parseInEventMode(urlParams) {
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
    let splunkFieldName; let splunkFieldValue;
    let indicatorForm;
    let splunkEvent;
    if (urlParams.has("sid")) {
        const {sid, offset} = parseInEventMode(urlParams);
        ({splunkEvent} = useSplunkSearchResults({sid, offset, count: 1}));
        ({splunkFieldName, splunkFieldValue} = queryParamsForFieldWorkflowAction(urlParams));
        console.log("Form props:", {splunkEvent, splunkFieldName, splunkFieldValue});
        indicatorForm = <NewIndicatorForm event={splunkEvent} initialSplunkFieldName={splunkFieldName}
                                          initialSplunkFieldValue={splunkFieldValue}/>;
    } else {
        indicatorForm = <NewIndicatorForm/>
    }
    return (
        <AppContainer>
            <Heading level={1}>Add Indicators of Compromise (IoC) to Grouping</Heading>
            <P>Add one or more related indicators to an existing grouping.</P>
            {splunkEvent &&
                <P>This form has been triggered via a workflow action. Splunk event fields are available in the "Splunk
                    Field Name" dropdown.</P>}
            {indicatorForm}
        </AppContainer>
    )
}

layoutWithTheme(<MainComponent/>);
