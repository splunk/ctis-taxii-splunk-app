import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import React from "react";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import DatetimeControlGroup from "@splunk/my-react-component/src/DateTimeControlGroup";
import moment from "moment";
import PropTypes from "prop-types";
import {useFormInputProps} from "../formInputProps";

export function TaxiiConfigField({fieldName, options, ...props}) {
    return <SelectControlGroup label="TAXII Config" {...useFormInputProps(fieldName)} options={options} {...props}/>
}

TaxiiConfigField.propTypes = {
    fieldName: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
}

export function TaxiiCollectionId({fieldName, options, ...props}) {
    return <SelectControlGroup label="TAXII Collection" {...useFormInputProps(fieldName)} options={options} {...props}/>
}

TaxiiCollectionId.propTypes = {
    fieldName: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
}

export function GroupingId({fieldName, ...props}) {
    return <TextControlGroup readOnly label="Grouping ID" {...useFormInputProps(fieldName)} {...props}/>
}

GroupingId.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function ScheduledAt({fieldName, ...props}) {
    const formInputProps = useFormInputProps(fieldName);
    const {value} = formInputProps;
    let helpText = '';
    if (value) {
        helpText = `Approximately ${moment.utc(value).fromNow()}`;
    }
    return <DatetimeControlGroup help={helpText} label="Scheduled At (UTC)" {...formInputProps} {...props}/>;
}

ScheduledAt.propTypes = {
    fieldName: PropTypes.string.isRequired
}
