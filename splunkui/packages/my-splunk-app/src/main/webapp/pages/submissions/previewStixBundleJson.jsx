import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import Loader from '@splunk/my-page/src/Loader';
import Code from '@splunk/react-ui/Code';
import Message from '@splunk/react-ui/Message';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { analyzeBundle } from '@splunk/my-page/src/stixBundleSubmissionCriteria';
import styled from 'styled-components';
import { variables } from '@splunk/themes';
import { useStixBundlePreview } from './hooks/useStixBundlePreview';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${variables.spacingMedium};
`;
function SubmissionCriteriaWarning({ violations }) {
    if (violations.length === 0) {
        return null;
    }
    return (
        <Message appearance="fill" type="warning">
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
SubmissionCriteriaWarning.propTypes = {
    violations: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            name: PropTypes.string,
            reasons: PropTypes.arrayOf(PropTypes.string).isRequired,
        }),
    ).isRequired,
};

export function PreviewStixBundleJson({ groupingId, includeSightings, advancedSettings }) {
    const { loading, error, bundleJsonString, bundle } = useStixBundlePreview(groupingId, includeSightings);
    const { minConfidenceForSubmission, tlpSubmissionAllowlist } = advancedSettings;

    const violations = useMemo(() => {
        if (!bundle) {
            return [];
        }
        return analyzeBundle(bundle, {
            minConfidence: minConfidenceForSubmission,
            tlpAllowlist: tlpSubmissionAllowlist,
        }).violations;
    }, [bundle, minConfidenceForSubmission, tlpSubmissionAllowlist]);

    return (
        <Container>
            {!loading && !error && <SubmissionCriteriaWarning violations={violations} />}
            <CollapsiblePanel title="Preview of STIX Bundle JSON">
                <Loader error={error} loading={loading}>
                    <Code language="json" value={bundleJsonString} />
                </Loader>
            </CollapsiblePanel>
        </Container>
    );
}
PreviewStixBundleJson.propTypes = {
    groupingId: PropTypes.string.isRequired,
    includeSightings: PropTypes.bool.isRequired,
    advancedSettings: PropTypes.shape({
        minConfidenceForSubmission: PropTypes.number.isRequired,
        tlpSubmissionAllowlist: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
};
