import { useMemo } from 'react';
import { analyzeBundle } from '@splunk/my-page/src/stixBundleSubmissionCriteria';
import { useStixBundlePreview } from './useStixBundlePreview';

export function useSubmissionCriteriaCheck(groupingId, includeSightings, advancedSettings) {
    const { loading, error, bundleJsonString, bundle } = useStixBundlePreview(
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

    return { loading, error, bundleJsonString, violations };
}
