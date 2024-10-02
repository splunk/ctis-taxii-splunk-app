import React from 'react';
import Card from '@splunk/react-ui/Card';
import {getSubmissions, useGetRecord} from "@splunk/my-react-component/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import styled from "styled-components";
import {urlForViewSubmission} from "./urls";
import {SubmissionStatusChip} from "./SubmissionStatusChip";
import moment from "moment";
import Loader from "./Loader";
import {CardContainer, StyledCard} from "./CardLayout";
import DL from '@splunk/react-ui/DefinitionList';

const HeaderContent = styled.div`
    display: flex;
    justify-content: flex-end;
`;

export function SubmissionCard({submission}) {
    const scheduledAt = moment.utc(submission.scheduled_at);
    const now = moment();
    let dateText;
    if (scheduledAt.isBefore(now)) {
        dateText = `sent ${scheduledAt.fromNow()}`;
    } else {
        dateText = `scheduled ${scheduledAt.fromNow()}`;
    }
    let cardTitle;
    if(submission.status === "FAILED"){
        cardTitle = `Failed submission ${dateText}`;
    }else{
        cardTitle = `Submission ${dateText}`;
    }
    return <StyledCard to={urlForViewSubmission(submission.submission_id)} openInNewContext title="Click for more info">
        <Card.Header title={cardTitle} subtitle={scheduledAt.format()}>
            <HeaderContent>
                <SubmissionStatusChip status={submission.status}/>
            </HeaderContent>
        </Card.Header>
        <Card.Body>
            <DL termWidth={200}>
                <DL.Term>TAXII Config</DL.Term>
                <DL.Description>{submission.taxii_config_name}</DL.Description>
                <DL.Term>TAXII Collection</DL.Term>
                <DL.Description>{submission.collection_id}</DL.Description>
            </DL>
        </Card.Body>
    </StyledCard>
}

export function SubmissionCardLayout({groupingId}) {
    const {record: response, loading, error} = useGetRecord({
        restGetFunction: getSubmissions,
        restFunctionQueryArgs: {
            skip: 0,
            limit: 0,
            sort: "scheduled_at:-1",
            query: {
                grouping_id: groupingId,
            }
        },
    })
    const submissions = response?.records || [];
    return <CardContainer>
        <Loader loading={loading} error={error}>
            {submissions.length === 0 && <P>No submissions</P>}
            {submissions.map(submission => (
                <SubmissionCard key={submission.submission_id} submission={submission}/>
            ))}
        </Loader>
    </CardContainer>
}
