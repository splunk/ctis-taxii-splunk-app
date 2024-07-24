import ControlGroup from "@splunk/react-ui/ControlGroup";
import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { variables } from '@splunk/themes';

const DatetimeInput = styled.input`
    padding: ${variables.spacingXSmall} ${variables.spacingSmall};
    font-family: ${variables.fontFamily};
    font-size: ${variables.fontSize};
    color: ${variables.contentColorDefault};
`

const DatetimeControlGroup = ({label, value, onChange, error, help}) => {
    return (
        <ControlGroup label={label} help={help} error={error}>
            <DatetimeInput type="datetime-local" value={value} onChange={onChange} />
        </ControlGroup>
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
