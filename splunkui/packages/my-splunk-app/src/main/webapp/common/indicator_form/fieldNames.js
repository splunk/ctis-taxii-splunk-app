import {FORM_FIELD_TLP_V2_RATING} from "../tlp";
import {FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION} from "../confidence";

export const FIELD_TLP_RATING = FORM_FIELD_TLP_V2_RATING;

export const FIELD_SPLUNK_FIELD_NAME = "splunk_field_name";
export const FIELD_INDICATOR_VALUE = "indicator_value";
export const FIELD_INDICATOR_CATEGORY = "indicator_category";
export const FIELD_STIX_PATTERN = "stix_pattern";
export const FIELD_INDICATOR_NAME = "name";
export const FIELD_INDICATOR_DESCRIPTION = "description";
export const FIELD_GROUPING_ID = "grouping_id";
export {FIELD_CONFIDENCE};
export const FIELD_VALID_FROM = "valid_from";
export const FIELD_INDICATORS = "indicators";
export const FIELD_LABELS = "labels";
export const FIELD_VALID_UNTIL = "valid_until";
export const FIELD_REVOKED = "revoked";

// For Edit Indicator Form
export const FIELD_INDICATOR_ID = "indicator_id";

function validateValidFromIsBeforeValidUntil(val, formValues) {
    if(formValues.valid_until !== ''){
        if(val > formValues.valid_until){
            return 'Expected valid_from to be before valid_until';
        }
    }
    return null;
}

function validateValidUntilIsAfterValidFrom(val, formValues) {
    if(val !== ''){
        if(val < formValues.valid_from){
            return 'Expected valid_until to be after valid_from';
        }
    }
    return null;
}
export const REGISTER_FIELD_OPTIONS = {
    [FIELD_INDICATOR_ID] : {
        required: "Indicator ID is required."
    },
    [FIELD_GROUPING_ID]: {
        required: "Grouping ID is required."
    },
    [FIELD_TLP_RATING]: {
        required: "TLP v2.0 Marking is required."
    },
    [FIELD_CONFIDENCE]: FIELD_CONFIDENCE_OPTION,
    [FIELD_VALID_FROM]: {
        required: "Valid from is required.",
        validate: validateValidFromIsBeforeValidUntil
    },
    [FIELD_INDICATORS]: {
        // TODO: validate at least one array length >= 1
        // rules: {
        //     required: "At least one indicator is required."
        // }
    },
    [FIELD_SPLUNK_FIELD_NAME]: {},
    [FIELD_INDICATOR_VALUE]: {
        required: "Indicator Value is required."
    },
    [FIELD_INDICATOR_CATEGORY]: {
        required: "Indicator Category is required."
    },
    [FIELD_STIX_PATTERN]: {
        required: "STIX Pattern is required."
    },
    [FIELD_INDICATOR_NAME]: {
        required: "Indicator Name is required."
    },
    [FIELD_INDICATOR_DESCRIPTION]: {
        required: "Indicator Description is required."
    },
    [FIELD_VALID_UNTIL]: {
        required: false,
        validate: validateValidUntilIsAfterValidFrom
    },
    [FIELD_LABELS]: {
        required: false
    },
    [FIELD_REVOKED]: {
        required: false
    }
}
