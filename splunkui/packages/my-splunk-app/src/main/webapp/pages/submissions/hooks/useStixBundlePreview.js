import { getStixBundleForGrouping, useGetRecord } from '@splunk/my-page/src/ApiClient';
import { isNil } from 'lodash';
import { useEffect, useState } from 'react';

export function useStixBundlePreview(groupingId, includeSightings = false) {
    const [bundleJsonString, setBundleJsonString] = useState(null);
    const { loading, record, error, isStale } = useGetRecord({
        restGetFunction: getStixBundleForGrouping,
        restFunctionQueryArgs: { groupingId, includeSightings },
    });
    useEffect(() => {
        if (!isNil(record?.bundle)) {
            setBundleJsonString(JSON.stringify(record.bundle, null, 4));
        }
    }, [record]);
    return { loading, error, isStale, bundleJsonString, bundle: record?.bundle };
}
