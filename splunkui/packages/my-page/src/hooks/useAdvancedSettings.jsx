import { useMemo } from 'react';
import { getAdvancedSettings, useGetRecord } from '../ApiClient';
import { tlpV2RatingOptions } from '../tlpV2Rating';

export const DEFAULT_CONFIDENCE_FALLBACK = 100;

function parseDefaultTlpV2Rating(value) {
    return tlpV2RatingOptions.some((option) => option.value === value) ? value : '';
}

function parseDefaultConfidence(value) {
    const confidence = Number(value);
    const isValid = value !== undefined && value !== null && value !== '' && Number.isInteger(confidence) && confidence >= 0 && confidence <= 100;
    return isValid ? confidence : DEFAULT_CONFIDENCE_FALLBACK;
}

function parseMinConfidenceForSubmission(value) {
    const confidence = Number(value);
    const isValid = value !== undefined && value !== null && value !== '' && Number.isInteger(confidence) && confidence >= 0 && confidence <= 100;
    return isValid ? confidence : 0;
}

// Values are '|' delimited. A missing/empty/unrecognised value means "all TLP values allowed",
// matching the globalConfig default.
function parseTlpSubmissionAllowlist(value) {
    const allTlpValues = tlpV2RatingOptions.map((option) => option.value);
    if (typeof value !== 'string' || value === '') {
        return allTlpValues;
    }
    const allowed = value.split('|').filter((v) => allTlpValues.includes(v));
    return allowed.length > 0 ? allowed : allTlpValues;
}

export function useAdvancedSettings() {
    const { loading, record, error } = useGetRecord({
        restGetFunction: getAdvancedSettings,
        restFunctionQueryArgs: {},
    });
    // Derived straight from the record (not via effect + state) so that consumers see the
    // parsed values in the same render in which `loading` becomes false.
    const advancedSettings = useMemo(
        () => ({
            defaultTaxiiConfigName: record?.default_taxii_config ?? '',
            enableSightings: record?.enable_sightings === '1',
            defaultTlpV2Rating: parseDefaultTlpV2Rating(record?.default_tlp_v2_rating),
            defaultConfidence: parseDefaultConfidence(record?.default_confidence),
            minConfidenceForSubmission: parseMinConfidenceForSubmission(record?.min_confidence_for_submission),
            tlpSubmissionAllowlist: parseTlpSubmissionAllowlist(record?.tlp_2_0_submission_allowlist),
        }),
        [record],
    );

    // Initial values for the TLP and Confidence fields of the "New ..." forms.
    const formDefaults = useMemo(
        () => ({
            tlpV2Rating: advancedSettings.defaultTlpV2Rating,
            confidence: advancedSettings.defaultConfidence,
        }),
        [advancedSettings],
    );

    return { loading, error, advancedSettings, formDefaults };
}
