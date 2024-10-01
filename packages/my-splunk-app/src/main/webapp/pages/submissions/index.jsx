import React from 'react';
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import {layoutWithTheme} from "../../common/theme";
import Loader from "@splunk/my-react-component/src/Loader";
import {getUrlQueryParams} from "../../common/queryParams";
import {Form} from "./form";
import {getSubmission, useGetRecord} from "@splunk/my-react-component/src/ApiClient";
import Heading from "@splunk/react-ui/Heading";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import styled from "styled-components";
import Message from '@splunk/react-ui/Message';


const Container = styled.div`
    max-width: 1000px;
`;
const StyledMessage = styled(Message)`
    margin: 0;
`;

function ViewSubmissionRecord({submissionId}) {
    const {error, record, loading} = useGetRecord({
        restGetFunction: getSubmission,
        restFunctionQueryArgs: {submissionId}
    });
    const noContent = "None";
    let statusAppearance = "info";
    if (record?.status === "SENT") {
        statusAppearance = "success";
    }else if (record?.status === "FAILED") {
        statusAppearance = "error";
    }
    // <Chip appearance={statusChipAppearance}>{record?.status}</Chip>
    return (<Loader loading={loading} error={error}>
        <Container>
            <Heading>Submission</Heading>
            {record &&
                <section>
                    <CustomControlGroup label="Submission ID" value={record?.submission_id} readOnly={true}/>
                    <CustomControlGroup label="Grouping ID" value={record?.grouping_id} readOnly={true}/>
                    <CustomControlGroup label="Status" value={
                        <StyledMessage appearance="fill" type={statusAppearance}>{record?.status}</StyledMessage>
                    } readOnly={true}/>
                    <CustomControlGroup label="Scheduled At (UTC)" value={record?.scheduled_at} readOnly={true}/>
                    <CustomControlGroup label="TAXII Config Name" value={record?.taxii_config_name} readOnly={true}/>
                    <CustomControlGroup label="TAXII Collection ID" value={record?.collection_id} readOnly={true}/>
                    <CustomControlGroup label="Bundle JSON Sent" value={record?.bundle_json_sent ?? noContent} readOnly={true}/>
                    <CustomControlGroup label="Response from TAXII Server" value={record?.response_json ?? noContent}
                                        readOnly={true}/>
                    <CustomControlGroup label="Error Message" value={record?.error_message ?? noContent} readOnly={true}/>

                </section>
            }
        </Container>
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
