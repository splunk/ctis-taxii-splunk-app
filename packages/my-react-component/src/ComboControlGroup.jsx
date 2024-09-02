import React from "react";
import PropTypes from "prop-types";
import {CustomControlGroup} from "./CustomControlGroup";
import ComboBox from '@splunk/react-ui/ComboBox';

// https://splunkui.splunk.com/Packages/react-ui/ComboBox?section=examples#Controlled%20value
const ComboControlGroup = ({label, value, onChange, help, error, options}) => {
    return (
        <CustomControlGroup label={label} help={help} error={error}>
            <ComboBox inline onChange={onChange} value={value}>
                {options.map((option) => <ComboBox.Option key={option} value={option} />)}
            </ComboBox>
        </CustomControlGroup>
    );

}
ComboControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string
}

export default ComboControlGroup;
