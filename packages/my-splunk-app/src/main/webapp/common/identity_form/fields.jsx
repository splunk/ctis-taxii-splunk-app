import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import React from "react";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import PropTypes from "prop-types";
import {useFormInputProps} from "../formInputProps";

export function IdentityIdField({fieldName, ...props}) {
    return <TextControlGroup label="Identity ID" {...useFormInputProps(fieldName)} {...props}/>
}

IdentityIdField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function NameField({fieldName, ...props}) {
    return <TextControlGroup label="Name" {...useFormInputProps(fieldName)} {...props}/>
}

NameField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function IdentityClassField({fieldName, options, ...props}) {
    return <SelectControlGroup label="Identity Class" {...useFormInputProps(fieldName)} options={options} {...props}/>
}

IdentityClassField.propTypes = {
    fieldName: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
}
