import React from 'react';
import Card from '@splunk/react-ui/Card';
import P from '@splunk/react-ui/Paragraph';
import styled from 'styled-components';
import { variables } from '@splunk/themes';
import PropTypes from 'prop-types';
import { getIndicators, useGetRecord } from './ApiClient';
import Loader from './Loader';
import { viewIndicator } from './urls';
import { CardContainer, StyledCard } from './CardLayout';

const StyledParagraph = styled(P)`
    font-size: ${variables.fontSize};
`;

export function IndicatorCard({ indicator_id, name, description, stix_pattern }) {
    return (
        <StyledCard to={viewIndicator(indicator_id)} title="Click for more info">
            <Card.Header title={name ?? 'Indicator'} />
            <Card.Body>
                <P>{description}</P>
                <code>{stix_pattern}</code>
            </Card.Body>
        </StyledCard>
    );
}

IndicatorCard.propTypes = {
    indicator_id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    stix_pattern: PropTypes.string.isRequired,
};

function LayoutForIndicatorsExist({ indicators }) {
    return (
        <>
            <StyledParagraph>Up to first 10 indicators shown</StyledParagraph>
            {indicators.map((indicator) => (
                <IndicatorCard
                    key={indicator.indicator_id}
                    indicator_id={indicator.indicator_id}
                    name={indicator.name}
                    description={indicator.description}
                    stix_pattern={indicator.stix_pattern}
                />
            ))}
        </>
    );
}
LayoutForIndicatorsExist.propTypes = {
    indicators: PropTypes.array.isRequired,
};

export function IndicatorCardLayout({ groupingId }) {
    const {
        loading,
        record: response,
        error,
    } = useGetRecord({
        restGetFunction: getIndicators,
        restFunctionQueryArgs: {
            limit: 10,
            query: {
                grouping_id: groupingId,
            },
        },
    });
    return (
        <CardContainer>
            <Loader loading={loading} error={error}>
                {response?.records?.length > 0 ? (
                    <LayoutForIndicatorsExist indicators={response?.records} />
                ) : (
                    <StyledParagraph>No indicators</StyledParagraph>
                )}
            </Loader>
        </CardContainer>
    );
}

IndicatorCardLayout.propTypes = {
    groupingId: PropTypes.string.isRequired,
};
