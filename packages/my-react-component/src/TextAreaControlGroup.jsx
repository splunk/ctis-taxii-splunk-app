import {CustomControlGroup} from "./CustomControlGroup";
import TextArea from "@splunk/react-ui/TextArea";
import React from "react";
import PropTypes from "prop-types";

const TextAreaControlGroup = ({label, value, readOnly = false, onChange, help, error, ...rest}) => {
    return (
        <CustomControlGroup label={label} help={help} error={error} value={value} readOnly={readOnly}>
            <TextArea value={value} onChange={onChange} error={error} {...rest}/>
        </CustomControlGroup>
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
