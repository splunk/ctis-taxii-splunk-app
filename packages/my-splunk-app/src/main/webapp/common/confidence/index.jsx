import ConfidenceControlGroup from "@splunk/my-react-component/src/ConfidenceControlGroup";
import PropTypes from "prop-types";
import React from "react";
import {useFormInputProps} from "../formInputProps";

const confidenceFieldTooltip = `
The confidence property identifies the confidence that the creator has in the correctness of their data. The confidence value MUST be a number in the range of 0-100.
`;

export function ConfidenceField({fieldName, ...props}) {
    return <ConfidenceControlGroup label="Confidence (0-100)" max={100} min={0} step={5}
                                   tooltip={confidenceFieldTooltip}
                                   {...useFormInputProps(fieldName)}
                                   {...props}/>
}

ConfidenceField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export const FIELD_CONFIDENCE = "confidence";
export const FIELD_CONFIDENCE_OPTION = {
    required: "Confidence is required.",
}
