import Text from "@splunk/react-ui/Text";
import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {CustomControlGroup} from "./CustomControlGroup";

const TextControlGroup = ({label, value='', onChange, help, error, readOnly = false, ...props}) => {
    const [textValue, setTextValue] = useState(value);
    const handleOnChange = (e, {value}) => {
        setTextValue(value);
        onChange(e, {value});
    }
    useEffect(() => {
        if(value !== textValue){
            setTextValue(value);
        }
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
    help: PropTypes.string
}

export default TextControlGroup;
