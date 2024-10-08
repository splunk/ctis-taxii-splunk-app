import React from "react";
import GroupingSelectControlGroup from "@splunk/my-react-component/src/controls/GroupingSelectControlGroup";
import PropTypes from "prop-types";
import {useFormInputProps} from "../formInputProps";

export function GroupingIdFieldV2({fieldName, ...props}) {
    return <GroupingSelectControlGroup label="Grouping" {...useFormInputProps(fieldName)} {...props}/>
}

GroupingIdFieldV2.propTypes = {
    fieldName: PropTypes.string.isRequired
}
