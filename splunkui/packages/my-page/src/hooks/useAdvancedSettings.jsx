import { useMemo } from 'react';
import { getAdvancedSettings, useGetRecord } from '../ApiClient';
import { tlpV2RatingOptions } from '../tlpV2Rating';

const FALLBACK_DEFAULT_CONFIDENCE = 100;

function parseDefaultTlpV2Rating(value) {
    return tlpV2RatingOptions.some((option) => option.value === value) ? value : '';
}

function parseDefaultConfidence(value) {
    const confidence = Number(value);
    const isValid = value !== undefined && value !== null && value !== '' && Number.isInteger(confidence) && confidence >= 0 && confidence <= 100;
    return isValid ? confidence : FALLBACK_DEFAULT_CONFIDENCE;
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
        }),
        [record],
    );

    return { loading, error, advancedSettings };
}
