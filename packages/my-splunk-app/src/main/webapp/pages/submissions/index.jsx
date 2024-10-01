import React from 'react';
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import {layoutWithTheme} from "../../common/theme";
import Loader from "@splunk/my-react-component/src/Loader";
import {getUrlQueryParams} from "../../common/queryParams";
import {Form} from "./form";
import P from "@splunk/react-ui/Paragraph";

function ViewSubmissionRecord({submissionId}) {
    return (<Loader loading={false} error={null}>
        <P>{submissionId}</P>
    </Loader>);
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('grouping_id') && queryParams.has('action', 'submit')) {
        const groupingId = queryParams.get('grouping_id');
        return <Form groupingId={groupingId}/>
    } else if (queryParams.has('submission_id')) {
        const submissionId = queryParams.get('submission_id');
        return <ViewSubmissionRecord submissionId={submissionId}/>;
    } else {
        return <Loader error={'Invalid URL'} loading={false}/>
    }
}

function MyPage() {
    return <AppContainer><Router/></AppContainer>
}

layoutWithTheme(<MyPage/>);
