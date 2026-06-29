import { useEffect, useState } from 'react';
import { listTaxiiCollections } from '@splunk/my-page/src/ApiClient';

function collectionToOption(collection) {
    let label = `${collection.title} (${collection.id})`;
    if (collection.can_write === false) {
        label += ' [Cannot Write]';
    }
    return {
        label,
        value: collection.id,
        disabled: collection.can_write === false,
    };
}

export function useTaxiiCollectionsOptions({ selectedTaxiiConfig }) {
    const [collectionOptions, setCollectionOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        console.log('Selected TAXII Config:', selectedTaxiiConfig);
        if (selectedTaxiiConfig) {
            setLoading(true);
            listTaxiiCollections({
                taxiiConfigName: selectedTaxiiConfig,
                successHandler: (resp) => {
                    console.log('Collections:', resp);
                    const options = resp.collections.map((collection) =>
                        collectionToOption(collection),
                    );
                    setCollectionOptions(options);
                    setLoading(false);
                },
                errorHandler: async (errorResponse) => {
                    const errorText = await errorResponse.text();
                    const errMessage = `Error getting TAXII collections: ${errorText}`;
                    console.error(errMessage, errorResponse);
                    setLoading(false);
                    setError(errMessage);
                },
            }).then();
        }
    }, [selectedTaxiiConfig]);
    return { collectionOptions, loading, error };
}
