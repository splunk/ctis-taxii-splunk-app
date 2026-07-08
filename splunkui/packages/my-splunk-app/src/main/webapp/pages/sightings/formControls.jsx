import React from "react";
import PropTypes from "prop-types";
import TextAreaControlGroup from '@splunk/my-page/src/TextAreaControlGroup';
import {useFormInputProps} from "../../common/formInputProps";


export function DescriptionField({fieldName, ...props}) {
    return <TextAreaControlGroup label="Description" {...useFormInputProps(fieldName)} {...props}/>
}

DescriptionField.propTypes = {
    fieldName: PropTypes.string.isRequired
}
