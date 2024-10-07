import React, {useEffect, useState} from 'react';
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import Heading from "@splunk/react-ui/Heading";
import P from "@splunk/react-ui/Paragraph";
import SearchJob from '@splunk/search-job';
import Loader from "@splunk/my-react-component/src/Loader";
import PropTypes from "prop-types";
import {PageHeading, PageHeadingContainer} from "@splunk/my-react-component/PageHeading";
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

const useSplunkSearchResult = ({sid, offset, count = 1}) => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {

        SearchJob.fromSid(sid).getResults({offset, count}).subscribe({
            error: (e) => {
                setError(String(e));
                setLoading(false);
            },
            next: (results) => {
                setEvent(results.results[0]);
                setLoading(false);
            }
        });
    }, [sid, offset, count]);
    return {event, loading, error};
}

function NewIndicatorFormInWorkflowMode({sid, offset, splunkFieldName, splunkFieldValue}) {
    const {event, loading, error} = useSplunkSearchResult({sid, offset, count: 1});
    return <Loader loading={loading} error={error} loadingText="Loading search results...">
        <NewIndicatorForm event={event} initialSplunkFieldName={splunkFieldName}
                          initialSplunkFieldValue={splunkFieldValue}/>
    </Loader>;
}

NewIndicatorFormInWorkflowMode.propTypes = {
    sid: PropTypes.string.isRequired,
    offset: PropTypes.string.isRequired,
    splunkFieldName: PropTypes.string,
    splunkFieldValue: PropTypes.string
}

function MainComponent() {
    const urlParams = getUrlQueryParams();
    const hasSearchId = urlParams.has("sid");
    const {sid, offset} = parseInEventMode(urlParams);
    const {splunkFieldName, splunkFieldValue} = queryParamsForFieldWorkflowAction(urlParams);

    return (
        <AppContainer>
            <PageHeadingContainer>
                <PageHeading level={1}>Add Indicators of Compromise (IoC) to Grouping</PageHeading>
            </PageHeadingContainer>
            <P>Add one or more related indicators to an existing grouping.</P>
            {hasSearchId && <NewIndicatorFormInWorkflowMode sid={sid} offset={offset} splunkFieldName={splunkFieldName}
                                                            splunkFieldValue={splunkFieldValue}/>}
            {!hasSearchId && <NewIndicatorForm/>}
        </AppContainer>
    )
}

layoutWithTheme(<MainComponent/>);
