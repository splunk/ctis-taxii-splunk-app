import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import Loader from '@splunk/my-page/src/Loader';
import Code from '@splunk/react-ui/Code';
import Message from '@splunk/react-ui/Message';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${variables.spacingMedium};
`;
function SubmissionCriteriaError({ violations }) {
    if (violations.length === 0) {
        return null;
    }
    return (
        <Message appearance="fill" type="error">
            <Message.Title>Submission Criteria set by the admin is in violation</Message.Title>
            <ul>
                {violations.map((violation) => (
                    <li key={violation.id}>
                        {violation.type}
                        {violation.name ? ` "${violation.name}"` : ''} ({violation.id}):{' '}
                        {violation.reasons.join('; ')}
                    </li>
                ))}
            </ul>
        </Message>
    );
}
SubmissionCriteriaError.propTypes = {
    violations: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            name: PropTypes.string,
            reasons: PropTypes.arrayOf(PropTypes.string).isRequired,
        }),
    ).isRequired,
};

export function PreviewStixBundleJson({ loading, error, bundleJsonString, violations }) {
    return (
        <Container>
            {!loading && !error && <SubmissionCriteriaError violations={violations} />}
            <CollapsiblePanel title="Preview of STIX Bundle JSON">
                <Loader error={error} loading={loading}>
                    <Code language="json" value={bundleJsonString} />
                </Loader>
            </CollapsiblePanel>
        </Container>
    );
}
PreviewStixBundleJson.propTypes = {
    loading: PropTypes.bool.isRequired,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    bundleJsonString: PropTypes.string,
    violations: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired })).isRequired,
};
PreviewStixBundleJson.defaultProps = {
    error: null,
    bundleJsonString: null,
};
