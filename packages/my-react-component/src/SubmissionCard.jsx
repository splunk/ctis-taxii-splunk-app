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
    const cardTitle = `Submission ${dateText}`;
    return <StyledCard to={urlForViewSubmission(submission.submission_id)} openInNewContext>
        <Card.Header title={cardTitle} subtitle={scheduledAt.format()}>
            <HeaderContent>
                <SubmissionStatusChip status={submission.status}/>
            </HeaderContent>
        </Card.Header>
        <Card.Body>
            <P>Sent to TAXII Collection {submission.collection_id} ({submission.taxii_config_name})</P>
        </Card.Body>
    </StyledCard>
}

export function SubmissionCardLayout({groupingId}) {
    const {record: response, loading, error} = useGetRecord({
        restGetFunction: getSubmissions,
        restFunctionQueryArgs: {
            skip: 0,
            limit: 0,
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
