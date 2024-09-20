import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import {useFormInputProps} from "../formInputProps";
import React from "react";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";

export function IdentityIdField({fieldName, ...props}) {
    return <TextControlGroup label="Identity ID" {...useFormInputProps(fieldName)} {...props}/>
}

export function NameField({fieldName, ...props}) {
    return <TextControlGroup label="Name" {...useFormInputProps(fieldName)} {...props}/>
}

export function IdentityClassField({fieldName, options, ...props}) {
    return <SelectControlGroup label="Identity Class" {...useFormInputProps(fieldName)} options={options} {...props}/>
}
