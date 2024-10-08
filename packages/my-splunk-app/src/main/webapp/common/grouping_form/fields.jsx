import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import React from "react";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import TextAreaControlGroup from "@splunk/my-react-component/src/TextAreaControlGroup";
import PropTypes from "prop-types";
import {useFormInputProps} from "../formInputProps";

export function GroupingIdField({fieldName, ...props}) {
    return <TextControlGroup label="Grouping ID" {...useFormInputProps(fieldName)} {...props}/>
}

GroupingIdField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function NameField({fieldName, ...props}) {
    return <TextControlGroup label="Name" {...useFormInputProps(fieldName)} {...props}/>
}

NameField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function DescriptionField({fieldName, ...props}) {
    return <TextAreaControlGroup label="Description" {...useFormInputProps(fieldName)} {...props}/>
}

DescriptionField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function ContextField({fieldName, options, ...props}) {
    return <SelectControlGroup label="Context" {...useFormInputProps(fieldName)} options={options} {...props}/>
}

ContextField.propTypes = {
    fieldName: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
}

export function CreatedByField({fieldName, options, ...props}) {
    return <SelectControlGroup label="Created By" {...useFormInputProps(fieldName)} options={options} {...props}/>
}

CreatedByField.propTypes = {
    fieldName: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
}
