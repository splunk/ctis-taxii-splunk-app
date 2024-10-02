import React from 'react';
import Card from '@splunk/react-ui/Card';
import {getSubmissions, useGetRecord} from "@splunk/my-react-component/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import styled from "styled-components";
import {urlForViewSubmission} from "./urls";
import {variables} from "@splunk/themes";
import {SubmissionStatusChip} from "./SubmissionStatusChip";

const StyledCard = styled(Card)`
    flex-basis: 100%;
`;
const CardContainer = styled.div`
    max-width: 1200px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: ${variables.spacingSmall};
`;

export function SubmissionCard({submission}) {
    const cardTitle = `Submission`;
    return <StyledCard to={urlForViewSubmission(submission.submission_id)} openInNewContext>
        <Card.Header title={cardTitle} subtitle='Click to view more detail'/>
        <Card.Body>
            <P>{submission.status}</P>
            <P><SubmissionStatusChip status={submission.status}/></P>
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
        {submissions.length === 0 && <P>No submissions</P>}
        {submissions.map(submission => (
            <SubmissionCard key={submission.submission_id} submission={submission}/>
        ))}
    </CardContainer>
}
