import ControlGroup from "@splunk/react-ui/ControlGroup";
import TextArea from "@splunk/react-ui/TextArea";
import React from "react";
import PropTypes from "prop-types";

const TextAreaControlGroup = ({label, value, onChange, help, error, ...rest}) => {
    return (
        <ControlGroup label={label} help={help} error={error} {...rest}>
            <TextArea value={value} onChange={onChange} error={error}/>
        </ControlGroup>
    );

}
TextAreaControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string
}

export default TextAreaControlGroup;
