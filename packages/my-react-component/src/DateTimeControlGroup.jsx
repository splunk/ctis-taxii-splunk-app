import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {variables} from '@splunk/themes';
import moment from "moment/moment";
import {CustomControlGroup} from "./CustomControlGroup";

export const DatetimeInput = styled.input`
    padding: ${variables.spacingXSmall} ${variables.spacingSmall};
    font-family: ${variables.fontFamily};
    font-size: ${variables.fontSize};
    color: ${variables.contentColorDefault};
`

const DatetimeControlGroup = ({
                                  label,
                                  value,
                                  readOnly = false,
                                  onChange,
                                  error,
                                  help,
                                  setHelpTextAsRelativeTime = false,
                                  ...props
                              }) => {
    const humanReadableDate = value ? new Date(value).toLocaleString() : '';
    let helpText = help;
    if (setHelpTextAsRelativeTime && value) {
        helpText = `Approximately ${moment.utc(value).fromNow()}`;
    }
    return (
        <CustomControlGroup label={label} help={helpText} error={error} value={humanReadableDate} readOnly={readOnly}>
            <DatetimeInput type="datetime-local" value={value} onChange={onChange} {...props}/>
        </CustomControlGroup>
    );
}
DatetimeControlGroup.propTypes = {
    readOnly: PropTypes.bool,
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string,
    setHelpTextAsRelativeTime: PropTypes.bool,
}
export default DatetimeControlGroup;
