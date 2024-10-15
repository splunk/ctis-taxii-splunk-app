import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import React from "react";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import DatetimeControlGroup from "@splunk/my-react-component/src/DateTimeControlGroup";
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
    return <DatetimeControlGroup setHelpTextAsRelativeTime label="Scheduled At (UTC)" {...useFormInputProps(fieldName)} {...props}/>;
}

ScheduledAt.propTypes = {
    fieldName: PropTypes.string.isRequired
}
