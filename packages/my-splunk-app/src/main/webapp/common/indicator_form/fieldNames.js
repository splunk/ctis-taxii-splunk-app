export const FIELD_SPLUNK_FIELD_NAME = "splunk_field_name";
export const FIELD_INDICATOR_VALUE = "indicator_value";
export const FIELD_INDICATOR_CATEGORY = "indicator_category";
export const FIELD_STIX_PATTERN = "stix_pattern";
export const FIELD_INDICATOR_NAME = "name";
export const FIELD_INDICATOR_DESCRIPTION = "description";
export const FIELD_GROUPING_ID = "grouping_id";
export const FIELD_CONFIDENCE = "confidence";
export const FIELD_TLP_RATING = "tlp_v1_rating";
export const FIELD_VALID_FROM = "valid_from";
export const FIELD_INDICATORS = "indicators";

export const REGISTER_FIELD_OPTIONS = {
    [FIELD_GROUPING_ID]: {
        required: "Grouping ID is required."
    },
    [FIELD_TLP_RATING]: {
        required: "TLP Rating is required."
    },
    [FIELD_CONFIDENCE]: {
        required: "Confidence is required."
    },
    [FIELD_VALID_FROM]: {
        required: "Valid from is required."
    },
    [FIELD_INDICATORS]: {
        rules: {
            required: "At least one indicator is required."
        }
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
    }
}
