import React from "react";
import PropTypes from "prop-types";
import Number from '@splunk/react-ui/Number';
import {CustomControlGroup} from "./CustomControlGroup";


const ConfidenceControlGroup = ({label, value, readOnly = false, tooltip, onChange, error, ...numberProps}) => {
    let confidenceQualitative;
    if (value >= 70) {
        confidenceQualitative = "High";
    } else if (value >= 30) {
        confidenceQualitative = "Medium";
    } else if (value >= 1) {
        confidenceQualitative = "Low";
    } else {
        confidenceQualitative = "None";
    }
    const help = `Confidence is ${confidenceQualitative}`;
    return (
        <CustomControlGroup label={label} help={help} tooltip={tooltip} error={error} value={value} readOnly={readOnly}>
            <Number {...numberProps} value={value} onChange={onChange} error={error}/>
        </CustomControlGroup>
    );
}

ConfidenceControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string,
    tooltip: PropTypes.string,
    readOnly: PropTypes.bool
}

export default ConfidenceControlGroup;
