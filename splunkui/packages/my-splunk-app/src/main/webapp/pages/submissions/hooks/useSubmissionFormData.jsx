import {
    getGrouping,
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
        loading: loadingAdvancedSettings,
        error: errorAdvancedSettings,
        advancedSettings,
    } = useAdvancedSettings();

    const loading =
        loadingGrouping || loadingTaxiiConfigs || loadingAdvancedSettings;
    const error = groupingError || taxiiConfigError || errorAdvancedSettings;

    return { loading, error, taxiiConfig, advancedSettings };
}
