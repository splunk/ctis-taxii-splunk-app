import React from 'react';
import PropTypes from 'prop-types';
import Message from '@splunk/react-ui/Message';
import Loader from '@splunk/my-page/src/Loader';
import List from '@splunk/react-ui/List';
import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

function ListOfIndicatorIds({indicatorIds}){
    return <List>
        {indicatorIds.map(id => <List.Item key={id}>{id}</List.Item>)}
    </List>
}
ListOfIndicatorIds.propTypes = {
    indicatorIds: PropTypes.arrayOf(PropTypes.string).isRequired,
}

const Container = styled.div`
    margin-top: ${variables.spacingLarge};
    margin-bottom: ${variables.spacingLarge};
`;

export default function IndicatorsValidationSummary({
    indicators,
    validationLoading,
    validationError,
    existingIndicatorIds
}) {
    if (indicators.length === 0) {
        return null;
    }

    return (
        <Loader loading={validationLoading}>
            {validationError && (
                <Message appearance="fill" type="error">
                    {validationError}
                </Message>
            )}
            {!validationError &&
                <Container>
                    <div>Indicators found: {indicators.length}</div>
                    {existingIndicatorIds.length > 0 && (
                        <Message appearance="fill" type="warning">
                            Warning: Existing indicators found. Expand to see list of IDs.
                            <CollapsiblePanel title="Existing Indicator IDs">
                                <ListOfIndicatorIds indicatorIds={existingIndicatorIds} />
                            </CollapsiblePanel>
                        </Message>
                    )}
                </Container>}
        </Loader>
    );
}

IndicatorsValidationSummary.propTypes = {
    indicators: PropTypes.arrayOf(PropTypes.object).isRequired,
    validationLoading: PropTypes.bool.isRequired,
    validationError: PropTypes.string,
    existingIndicatorIds: PropTypes.arrayOf(PropTypes.string).isRequired
};

IndicatorsValidationSummary.defaultProps = {
    validationError: null
};
