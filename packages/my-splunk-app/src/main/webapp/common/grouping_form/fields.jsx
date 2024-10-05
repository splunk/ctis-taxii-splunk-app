import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import React from "react";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import TextAreaControlGroup from "@splunk/my-react-component/src/TextAreaControlGroup";
import {useFormInputProps} from "../formInputProps";

export function GroupingIdField({fieldName, ...props}) {
    return <TextControlGroup label="Grouping ID" {...useFormInputProps(fieldName)} {...props}/>
}

export function NameField({fieldName, ...props}) {
    return <TextControlGroup label="Name" {...useFormInputProps(fieldName)} {...props}/>
}
export function DescriptionField({fieldName, ...props}) {
    return <TextAreaControlGroup label="Description" {...useFormInputProps(fieldName)} {...props}/>
}

export function ContextField({fieldName, options, ...props}) {
    return <SelectControlGroup label="Context" {...useFormInputProps(fieldName)} options={options} {...props}/>
}

export function CreatedByField({fieldName, options, ...props}) {
    return <SelectControlGroup label="Created By" {...useFormInputProps(fieldName)} options={options} {...props}/>
}
