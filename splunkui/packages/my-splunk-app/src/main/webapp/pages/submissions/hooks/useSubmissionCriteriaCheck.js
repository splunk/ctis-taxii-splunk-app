import { isNil } from 'lodash';
import { useMemo } from 'react';
import { analyzeBundle } from '@splunk/my-page/src/stixBundleSubmissionCriteria';
import { useStixBundlePreview } from './useStixBundlePreview';

export function useSubmissionCriteriaCheck(groupingId, includeSightings, advancedSettings) {
    const { loading, error, isStale, bundleJsonString, bundle } = useStixBundlePreview(
        groupingId,
        includeSightings,
    );
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

    // True only when a bundle for the current grouping/sightings choice has loaded without error.
    const isCheckComplete = !loading && !isStale && !error && !isNil(bundle);

    return { loading, error, bundleJsonString, violations, isCheckComplete };
}
