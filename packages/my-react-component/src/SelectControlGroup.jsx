import Select from "@splunk/react-ui/Select";
import React from "react";
import PropTypes from "prop-types";
import {CustomControlGroup} from "./CustomControlGroup";

const SelectControlGroup = ({label, value, onChange, error, help, options, disabled = false, loading = false}) => {
    const loadingSelect = <Select disabled={true} defaultValue={"loading"}>
        <Select.Option label={"Loading..."} value={"loading"}/>
    </Select>;
    return (
        <CustomControlGroup label={label} help={help} error={error}>
            {loading ? loadingSelect :
                <Select disabled={disabled} value={value} onChange={onChange} error={error}>
                    {options.map(option => (
                        <Select.Option key={option.value} label={option.label} value={option.value}/>
                    ))}
                </Select>}
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
