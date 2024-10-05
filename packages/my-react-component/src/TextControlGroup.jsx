import Text from "@splunk/react-ui/Text";
import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {CustomControlGroup} from "./CustomControlGroup";

const TextControlGroup = ({label, value='', onChange, help, error, readOnly = false, ...props}) => {
    const [textValue, setTextValue] = useState(value);
    const handleOnChange = (e, {value: eventValue}) => {
        setTextValue(eventValue);
        onChange(e, {value: eventValue});
    }

    useEffect(() => {
        setTextValue(oldValue => {
            if (oldValue !== value) {
                return value;
            }
            return oldValue;
        });
    }, [value]);
    return (
        <CustomControlGroup label={label} help={help} error={error} readOnly={readOnly} value={value}>
            <Text canClear value={textValue} onChange={handleOnChange} error={error} {...props}/>
        </CustomControlGroup>
    );

}
TextControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string,
    readOnly: PropTypes.bool
}

export default TextControlGroup;
