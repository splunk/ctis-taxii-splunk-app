import Select from "@splunk/react-ui/Select";
import React from "react";
import PropTypes from "prop-types";
import {CustomControlGroup} from "./CustomControlGroup";

const SelectControlGroup = ({
                                label,
                                value,
                                onChange,
                                error,
                                help,
                                options,
                                readOnly = false,
                                disabled = false,
                                loading = false
                            }) => {
    return (
        <CustomControlGroup label={label} help={help} error={error} value={value} readOnly={readOnly}>
            <Select disabled={disabled} value={value} onChange={onChange} error={error}
                    animateLoading={true}
                    isLoadingOptions={loading}>
                {options.map(option => (
                    <Select.Option disabled={option.disabled ?? false} key={option.value} label={option.label} value={option.value}/>
                ))}
            </Select>
        </CustomControlGroup>
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
