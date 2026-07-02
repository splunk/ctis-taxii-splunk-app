import { useEffect, useMemo, useState } from 'react';
import { getAdvancedSettings, useGetRecord } from '../ApiClient';

export function useAdvancedSettings() {
    const [defaultTaxiiConfigName, setDefaultTaxiiConfigName] = useState('');
    const [enableSightings, setEnableSightings] = useState(false);
    const advancedSettings = useMemo(
        () => ({
            defaultTaxiiConfigName,
            enableSightings
        }),
        [defaultTaxiiConfigName, enableSightings],
    );
    const { loading, record, error } = useGetRecord({
        restGetFunction: getAdvancedSettings,
        restFunctionQueryArgs: {},
    });
    useEffect(() => {
        if (record !== null) {
            setDefaultTaxiiConfigName(record.default_taxii_config ?? '');
            setEnableSightings(record.enable_sightings === '1');
        }
    }, [record]);

    return { loading, error, advancedSettings };
}
