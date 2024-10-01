import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import {useFormInputProps} from "../formInputProps";
import React from "react";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import DatetimeControlGroup from "@splunk/my-react-component/src/DateTimeControlGroup";
import moment from "moment";



export function TaxiiConfigField({fieldName, options, ...props}) {
    return <SelectControlGroup label="TAXII Config" {...useFormInputProps(fieldName)} options={options} {...props}/>
}

export function TaxiiCollectionId({fieldName, options, ...props}) {
    return <SelectControlGroup label="TAXII Collection" {...useFormInputProps(fieldName)} options={options} {...props}/>
}

export function GroupingId({fieldName, ...props}) {
    return <TextControlGroup readOnly={true} label="Grouping ID" {...useFormInputProps(fieldName)} {...props}/>
}

export function ScheduledAt({fieldName, ...props}) {
    const formInputProps = useFormInputProps(fieldName);
    const {value} = formInputProps;
    let helpText = '';
    if(value) {
        helpText = `Approximately ${moment.utc(value).fromNow()}`;
    }
    return <DatetimeControlGroup help={helpText} label="Scheduled At (UTC)" {...formInputProps} {...props}/>;
}
