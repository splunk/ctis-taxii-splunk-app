import React from 'react';
import Card from '@splunk/react-ui/Card';
import {getIndicator, useGetRecord} from "@splunk/my-react-component/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import styled from "styled-components";
import {variables} from "@splunk/themes";
import PropTypes from "prop-types";
import Loader from "./Loader";
import {viewIndicator} from "./urls";
import {CardContainer, StyledCard} from "./CardLayout";

const StyledParagraph = styled(P)`
    font-size: ${variables.fontSizeLarge};
`;

export function IndicatorCard({indicatorId}) {
    const {loading, record, error} = useGetRecord({
        restGetFunction: getIndicator,
        restFunctionQueryArgs: {indicatorId},
    });
    const cardTitle = record ? `${record?.name}` : 'Indicator';
    return <StyledCard to={viewIndicator(indicatorId)} title="Click for more info">
        <Card.Header title={cardTitle}/>
        <Card.Body>
            <Loader loading={loading} error={error}>
                <P>{record?.description}</P>
                <code>{record?.stix_pattern}</code>
            </Loader>
        </Card.Body>
    </StyledCard>
}

IndicatorCard.propTypes = {
    indicatorId: PropTypes.string.isRequired
}

export function IndicatorCardLayout({indicatorIds}) {
    if (indicatorIds.length === 0) {
        return <StyledParagraph>No indicators</StyledParagraph>;
    }
    return <CardContainer>
        {indicatorIds.map(indicatorId => (
            <IndicatorCard key={indicatorId} indicatorId={indicatorId}/>
        ))}
    </CardContainer>

}

IndicatorCardLayout.propTypes = {
    indicatorIds: PropTypes.array.isRequired
}
