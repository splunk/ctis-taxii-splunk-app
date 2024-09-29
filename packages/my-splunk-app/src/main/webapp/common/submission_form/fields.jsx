import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import {useFormInputProps} from "../formInputProps";
import React from "react";



export function TaxiiConfigField({fieldName, options, ...props}) {
    return <SelectControlGroup label="TAXII Config" {...useFormInputProps(fieldName)} options={options} {...props}/>
}

export function TaxiiCollectionId({fieldName, options, ...props}) {
    return <SelectControlGroup label="TAXII Collection" {...useFormInputProps(fieldName)} options={options} {...props}/>
}
