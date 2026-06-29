import { useEffect } from 'react';
import { validateScheduledAt } from './validation';

export const FIELD_TAXII_CONFIG_NAME = 'taxii_config_name';
export const FIELD_TAXII_COLLECTION_ID = 'taxii_collection_id';
export const FIELD_GROUPING_ID = 'grouping_id';
export const FIELD_SCHEDULED_AT = 'scheduled_at';

export function useRegisterFormFields(register, isScheduledSubmission){
    useEffect(() => {
        register(FIELD_GROUPING_ID, { required: 'Grouping ID is required' });
        register(FIELD_TAXII_CONFIG_NAME, { required: 'TAXII Config is required' });
        register(FIELD_TAXII_COLLECTION_ID, {
            required: 'TAXII Collection is required',
        });

        register(FIELD_SCHEDULED_AT, {
            validate: (value) => {
                if (isScheduledSubmission) {
                    return validateScheduledAt(value);
                }
                return null;
            },
        });
    }, [register, isScheduledSubmission]);
}
