import SelectControlGroup from "@splunk/my-page/src/SelectControlGroup";
import React from "react";
import TextControlGroup from "@splunk/my-page/src/TextControlGroup";
import TextAreaControlGroup from "@splunk/my-page/src/TextAreaControlGroup";
import PropTypes from "prop-types";
import {useFormInputProps} from "../formInputProps";
import {GROUPING_CONTEXTS} from './const';

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

export function ContextField({fieldName, ...props}) {
    return <SelectControlGroup label="Context" {...useFormInputProps(fieldName)} options={GROUPING_CONTEXTS} {...props}/>
}

ContextField.propTypes = {
    fieldName: PropTypes.string.isRequired,
}

export function CreatedByField({fieldName, options, ...props}) {
    return <SelectControlGroup label="Created By" {...useFormInputProps(fieldName)} options={options} {...props}/>
}

CreatedByField.propTypes = {
    fieldName: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
}
