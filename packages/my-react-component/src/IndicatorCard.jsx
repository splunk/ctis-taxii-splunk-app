import React from 'react';
import Card from '@splunk/react-ui/Card';
import {getIndicator, useGetRecord} from "@splunk/my-react-component/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import Loader from "./Loader";
import {viewIndicator} from "./urls";
import {CardContainer, StyledCard} from "./CardLayout";

export function IndicatorCard({indicatorId}) {
    const {loading, record, error} = useGetRecord({
        restGetFunction: getIndicator,
        restFunctionQueryArgs: {indicatorId},
    });
    const cardTitle = record ? `Indicator: ${record?.name}` : 'Indicator';
    return <StyledCard to={viewIndicator(indicatorId)} openInNewContext title="Click for more info">
        <Card.Header title={cardTitle}/>
        <Card.Body>
            <Loader loading={loading} error={error}>
                <P>{record?.description}</P>
                <code>{record?.stix_pattern}</code>
            </Loader>
        </Card.Body>
    </StyledCard>
}

export function IndicatorCardLayout({indicatorIds}) {
    if (indicatorIds.length === 0) {
        return <P>No indicators</P>;
    } else {
        return <CardContainer>
            {indicatorIds.map(indicatorId => (
                <IndicatorCard key={indicatorId} indicatorId={indicatorId}/>
            ))}
        </CardContainer>
    }
}
