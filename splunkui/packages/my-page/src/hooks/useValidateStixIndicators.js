import { useEffect, useState } from 'react';
import { postValidateStixIndicatorsToImport } from '../ApiClient';

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
                    // TODO: Replace with existing errorToText() in ApiClient.js
                    if(error instanceof Response){
                        const respJson = await error.json();
                        if(typeof respJson?.error === 'string'){
                            setValidationError(`Validation Error: ${respJson.error}`);
                        }else{
                            setValidationError(JSON.stringify(respJson));
                        }
                    }else{
                        setValidationError(String(error));
                    }
                    setLoading(false);
                 }
            })
        }
    }, [indicators]);
    return {validationError, loading, existingIndicatorIds};
}
