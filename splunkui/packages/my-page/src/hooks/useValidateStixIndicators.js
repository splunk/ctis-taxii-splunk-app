import { useEffect, useState } from 'react';
import { postValidateStixIndicatorsToImport ,errorToText} from '../ApiClient';

// TODO: Extract reusable logic to help create useValidateStixIdentities(identities)
export function useValidateStixIndicators(indicators) {
   const [validationError, setValidationError] = useState(null);
   const [loading, setLoading] = useState(false);
   const [existingIndicatorIds, setExistingIndicatorIds] = useState([]);

    useEffect(() => {
        if(Array.isArray(indicators) && indicators.length > 0) {
            setLoading(true);
            postValidateStixIndicatorsToImport({
                indicators, successHandler: (resp) => {
                    setValidationError(null);
                    setExistingIndicatorIds(resp?.existing_ids ?? [])
                    setLoading(false);
                }, errorHandler: async (error) => {
                    setValidationError(await errorToText(error));
                    setLoading(false);
                }
            })
        }
    }, [indicators]);
    return {validationError, loading, existingIndicatorIds};
}
