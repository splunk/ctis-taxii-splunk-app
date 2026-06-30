import {
    getGrouping,
    getStixBundleForGrouping,
    getTaxiiConfigs,
    useGetRecord,
} from '@splunk/my-page/src/ApiClient';
import { useAdvancedSettings } from './useAdvancedSettings';

export function useSubmissionFormData(groupingId) {
    // Validates groupingId, but does not use response
    const { loading: loadingGrouping, error: groupingError } = useGetRecord({
        restGetFunction: getGrouping,
        restFunctionQueryArgs: { groupingId },
    });

    const {
        loading: loadingTaxiiConfigs,
        record: taxiiConfig,
        error: taxiiConfigError,
    } = useGetRecord({
        restGetFunction: getTaxiiConfigs,
        restFunctionQueryArgs: {},
    });

    const {
        loading: bundleLoading,
        record: bundle,
        error: bundleError,
    } = useGetRecord({
        restGetFunction: getStixBundleForGrouping,
        restFunctionQueryArgs: { groupingId },
    });
    const bundleJsonString = JSON.stringify(bundle?.bundle, null, 4);

    const {
        loading: loadingAdvancedSettings,
        error: errorAdvancedSettings,
        advancedSettings,
    } = useAdvancedSettings();

    const loading =
        loadingGrouping || bundleLoading || loadingTaxiiConfigs || loadingAdvancedSettings;
    const error = groupingError || bundleError || taxiiConfigError || errorAdvancedSettings;

    return { loading, error, taxiiConfig, bundleJsonString, advancedSettings };
}
