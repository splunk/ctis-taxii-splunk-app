import {
    getAdvancedSettings,
    getGrouping,
    getStixBundleForGrouping,
    getTaxiiConfigs,
    useGetRecord,
} from '@splunk/my-page/src/ApiClient';
import { useEffect, useMemo, useState } from 'react';

function useAdvancedSettings(){
    const [defaultTaxiiConfigName, setDefaultTaxiiConfigName] = useState('');
    const advancedSettings = useMemo(() => (
        {
            defaultTaxiiConfigName,
        }
    ), [defaultTaxiiConfigName])
    const { loading, record, error } = useGetRecord({
        restGetFunction: getAdvancedSettings,
        restFunctionQueryArgs: {},
    });
    useEffect(() => {
        if(record !== null){
            setDefaultTaxiiConfigName(record.default_taxii_config ?? '')

        }
    }, [record]);


    return {loading, error, advancedSettings};
}

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

    const { loading: loadingAdvancedSettings, error: errorAdvancedSettings, advancedSettings } =
        useAdvancedSettings();


    const loading =
        loadingGrouping || bundleLoading || loadingTaxiiConfigs || loadingAdvancedSettings;
    const error = groupingError || bundleError || taxiiConfigError || errorAdvancedSettings;

    return { loading, error, taxiiConfig, bundleJsonString, advancedSettings };
}
