import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import {tlpV2RatingOptions} from "@splunk/my-react-component/src/tlpV2Rating";
import PropTypes from "prop-types";
import React from "react";
import {useFormInputProps} from "../formInputProps";

export const FORM_FIELD_TLP_V2_RATING = "tlp_v2_rating";
export const FORM_FIELD_TLP_V2_RATING_OPTION = {required: "TLPv2 Rating is required.", value: ""};
export const FIELD_LABEL_TLP_V2_MARKING = "TLP v2.0 Marking";

export function TLPv2RatingField({fieldName, ...props}) {
    return <SelectControlGroup label={FIELD_LABEL_TLP_V2_MARKING}
                               options={tlpV2RatingOptions}
                               {...useFormInputProps(fieldName)}
                               {...props}
    />
}

TLPv2RatingField.propTypes = {
    fieldName: PropTypes.string.isRequired
}
