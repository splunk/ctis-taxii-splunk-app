import { getStixBundleForGrouping, useGetRecord } from '@splunk/my-page/src/ApiClient';
import { useEffect, useState } from 'react';

export function useStixBundlePreview(groupingId, includeSightings = false) {
    const [bundleJsonString, setBundleJsonString] = useState(null);
    const { loading, record, error } = useGetRecord({
        restGetFunction: getStixBundleForGrouping,
        restFunctionQueryArgs: { groupingId, includeSightings },
    });
    useEffect(() => {
        if (record?.bundle !== null) {
            setBundleJsonString(JSON.stringify(record?.bundle, null, 4));
        }
    }, [record]);
    return { loading, error, bundleJsonString };
}
