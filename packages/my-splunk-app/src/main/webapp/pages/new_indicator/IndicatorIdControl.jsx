import ControlGroup from "@splunk/react-ui/ControlGroup";
import Text from "@splunk/react-ui/Text";
import React from "react";
import PropTypes from "prop-types";

const IndicatorIdControl = ({value, onChange, error, help}) => {
    return (
        <ControlGroup label="Indicator ID" help={help} error={error}>
            <Text canClear value={value} onChange={onChange} error={error}/>
        </ControlGroup>
    );
}

IndicatorIdControl.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string
}
export default IndicatorIdControl;
