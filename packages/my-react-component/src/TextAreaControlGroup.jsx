import {CustomControlGroup} from "./CustomControlGroup";
import TextArea from "@splunk/react-ui/TextArea";
import React from "react";
import PropTypes from "prop-types";

const TextAreaControlGroup = ({label, value, onChange, help, error, ...rest}) => {
    return (
        <CustomControlGroup label={label} help={help} error={error} {...rest}>
            <TextArea value={value} onChange={onChange} error={error}/>
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
