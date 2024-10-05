import {CustomControlGroup} from "./CustomControlGroup";
import TextArea from "@splunk/react-ui/TextArea";
import React, {useEffect} from "react";
import PropTypes from "prop-types";

const TextAreaControlGroup = ({label, value='', readOnly = false, onChange, help, error, ...rest}) => {
    const [textAreaValue, setTextAreaValue] = React.useState(value);
    const handleOnChange = (e, {value}) => {
        setTextAreaValue(value);
        onChange(e, {value});
    }
    useEffect(() => {
        if(value !== textAreaValue){
            setTextAreaValue(value);
        }
    }, [value]);

    return (
        <CustomControlGroup label={label} help={help} error={error} value={value} readOnly={readOnly}>
            <TextArea value={textAreaValue} onChange={handleOnChange} error={error}/>
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
