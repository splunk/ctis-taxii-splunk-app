import ControlGroup from "@splunk/react-ui/ControlGroup";
import Number from "@splunk/react-ui/Number";
import React from "react";
import PropTypes from "prop-types";

const NumberControlGroup = ({label, value, onChange, help, error, ...numberProps}) => {
    return (
        <ControlGroup label={label} help={help} error={error}>
            <Number {...numberProps} value={value} onChange={onChange} error={error}/>
        </ControlGroup>
    );

}
NumberControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string
}

export default NumberControlGroup;
