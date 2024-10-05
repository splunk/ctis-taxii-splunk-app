import React, {useEffect} from "react";
import PropTypes from "prop-types";
import TextArea from "@splunk/react-ui/TextArea";
import {CustomControlGroup} from "./CustomControlGroup";

const TextAreaControlGroup = ({label, value = '', readOnly = false, onChange, help, error, ...rest}) => {
    const [textAreaValue, setTextAreaValue] = React.useState(value);
    const handleOnChange = (e, {value: eventValue}) => {
        setTextAreaValue(eventValue);
        onChange(e, {value: eventValue});
    }
    useEffect(() => {
        setTextAreaValue(oldValue => {
            if (oldValue !== value) {
                return value;
            }
            return oldValue;
        });
    }, [value]);

    return (
        <CustomControlGroup label={label} help={help} error={error} value={value} readOnly={readOnly}>
            <TextArea value={textAreaValue} onChange={handleOnChange} error={error} {...rest}/>
        </CustomControlGroup>
    );

}
TextAreaControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string,
    readOnly: PropTypes.bool
}

export default TextAreaControlGroup;
