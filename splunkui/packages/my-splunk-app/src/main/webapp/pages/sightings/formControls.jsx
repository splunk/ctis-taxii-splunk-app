import React from "react";
import PropTypes from "prop-types";
import IndicatorSelectControlGroup from '@splunk/my-page/src/controls/IndicatorSelectControlGroup';
import {useFormInputProps} from "../../common/formInputProps";

export function SightingOfRefField({fieldName, ...props}) {
    return <IndicatorSelectControlGroup label="Sighting of Ref" {...useFormInputProps(fieldName)} {...props}/>
}

SightingOfRefField.propTypes = {
    fieldName: PropTypes.string.isRequired
}
