import {CustomControlGroup} from "./CustomControlGroup";
import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {variables} from '@splunk/themes';

export const DatetimeInput = styled.input`
    padding: ${variables.spacingXSmall} ${variables.spacingSmall};
    font-family: ${variables.fontFamily};
    font-size: ${variables.fontSize};
    color: ${variables.contentColorDefault};
`

const DatetimeControlGroup = ({label, value, readOnly = false, onChange, error, help, ...props}) => {
    const humanReadableDate = value ? new Date(value).toLocaleString() : '';
    return (
        <CustomControlGroup label={label} help={help} error={error} value={humanReadableDate} readOnly={readOnly}>
            <DatetimeInput type="datetime-local" value={value} onChange={onChange} {...props}/>
        </CustomControlGroup>
    );
}
DatetimeControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string,
}
export default DatetimeControlGroup;
