import ControlGroup from "@splunk/react-ui/ControlGroup";
import Text from "@splunk/react-ui/Text";
import React from "react";
import PropTypes from "prop-types";

const TextControlGroup = ({label, value, onChange, help, error}) => {
    return (
        <ControlGroup label={label} help={help} error={error}>
            <Text canClear value={value} onChange={onChange} error={error}/>
        </ControlGroup>
    );

}
TextControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string
}

export default TextControlGroup;
