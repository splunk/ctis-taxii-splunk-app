import Text from "@splunk/react-ui/Text";
import React from "react";
import PropTypes from "prop-types";
import {CustomControlGroup} from "./CustomControlGroup";

const TextControlGroup = ({label, value, onChange, help, error, ...props}) => {
    return (
        <CustomControlGroup label={label} help={help} error={error}>
            <Text canClear value={value} onChange={onChange} error={error} {...props}/>
        </CustomControlGroup>
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
