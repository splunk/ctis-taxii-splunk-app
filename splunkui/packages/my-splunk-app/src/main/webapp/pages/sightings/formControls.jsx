import React from "react";
import PropTypes from "prop-types";
import IndicatorSelectControlGroup from '@splunk/my-page/src/controls/IndicatorSelectControlGroup';
import TextAreaControlGroup from '@splunk/my-page/src/TextAreaControlGroup';
import {useFormInputProps} from "../../common/formInputProps";

export function SightingOfRefField({fieldName, ...props}) {
    return <IndicatorSelectControlGroup label="Sighting of Ref" {...useFormInputProps(fieldName)} {...props}/>
}

SightingOfRefField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function DescriptionField({fieldName, ...props}) {
    return <TextAreaControlGroup label="Description" {...useFormInputProps(fieldName)} {...props}/>
}

DescriptionField.propTypes = {
    fieldName: PropTypes.string.isRequired
}
