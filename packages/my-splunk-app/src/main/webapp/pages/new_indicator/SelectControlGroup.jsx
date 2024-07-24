import ControlGroup from "@splunk/react-ui/ControlGroup";
import Select from "@splunk/react-ui/Select";
import React from "react";
import PropTypes from "prop-types";

const SelectControlGroup = ({label, value, onChange, error, help, options}) => {
    return (
        <ControlGroup label={label} help={help} error={error}>
            <Select value={value} onChange={onChange} error={error}>
                {options.map(option => (
                    <Select.Option key={option.value} label={option.label} value={option.value}/>
                ))}
            </Select>
        </ControlGroup>
    );
}
SelectControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string
    }))
}
export default SelectControlGroup;
