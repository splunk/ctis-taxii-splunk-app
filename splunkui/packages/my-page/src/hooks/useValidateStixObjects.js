import { useEffect, useState } from 'react';
import { errorToText, postValidateStixObjectsToImport } from '../ApiClient';

export function useValidateStixObjectsOfType({ modelType, stixObjects }) {
    const [validationError, setValidationError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [existingIds, setExistingIds] = useState([]);
    useEffect(() => {
        if (Array.isArray(stixObjects) && stixObjects.length > 0) {
            setLoading(true);
            postValidateStixObjectsToImport({
                stixObjects, modelType, successHandler: (resp) => {
                    setValidationError(null);
                    setExistingIds(resp?.existing_ids ?? []);
                    setLoading(false);
                }, errorHandler: async (error) => {
                    setValidationError(await errorToText(error));
                    setLoading(false);
                }
            }).then();
        }
    }, [stixObjects, modelType]);
    return { validationError, loading, existingIds };
}

export function useValidateStixIndicators(indicators) {
    return useValidateStixObjectsOfType({
        modelType: 'indicator',
        stixObjects: indicators
    });
}

export function useValidateStixIdentities(identities) {
    return useValidateStixObjectsOfType({
        modelType: 'identity',
        stixObjects: identities
    });
}
