import React from 'react';
import PropTypes from 'prop-types';
import Message from '@splunk/react-ui/Message';
import Loader from '@splunk/my-page/src/Loader';
import List from '@splunk/react-ui/List';
import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

function ListofStixIds({ids}){
    return <List>
        {ids.map(id => <List.Item key={id}>{id}</List.Item>)}
    </List>
}
ListofStixIds.propTypes = {
    ids: PropTypes.arrayOf(PropTypes.string).isRequired,
}

const Container = styled.div`
    margin-top: ${variables.spacingLarge};
    margin-bottom: ${variables.spacingLarge};
`;

export default function ValidationSummary({stixObjects, validationLoading, validationError, existingIds, stixObjectType}) {
    if (stixObjects.length === 0) {
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
                    <div>Number of {stixObjectType} objects found in file: {stixObjects.length}</div>
                    {existingIds.length > 0 && (
                        <Message appearance="fill" type="warning">
                            Warning: Some record(s) with the same ID already exist. Expand to see the list of IDs.
                            <CollapsiblePanel title={`Existing ${stixObjectType} IDs`}>
                                <ListofStixIds ids={existingIds} />
                            </CollapsiblePanel>
                        </Message>
                    )}
                </Container>}
        </Loader>
    );
}
ValidationSummary.propTypes = {
    stixObjects: PropTypes.arrayOf(PropTypes.shape({})),
    stixObjectType: PropTypes.string.isRequired,
    validationLoading: PropTypes.bool.isRequired,
    validationError: PropTypes.string,
    existingIds: PropTypes.arrayOf(PropTypes.string),
}

