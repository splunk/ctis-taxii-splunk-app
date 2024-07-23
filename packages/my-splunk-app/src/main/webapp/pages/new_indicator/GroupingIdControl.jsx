import ControlGroup from "@splunk/react-ui/ControlGroup";
import Select from "@splunk/react-ui/Select";
import React from "react";
import PropTypes from "prop-types";

const GroupingIdControl = ({value, onChange, error, help}) => {
    return (
        <ControlGroup label="Grouping ID" help={help} error={error}>
            <Select value={value} onChange={onChange} error={error}>
                <Select.Option label="Grouping A" value="A"/>
                <Select.Option label="Grouping B" value="B"/>
            </Select>
        </ControlGroup>
    );
}
GroupingIdControl.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string
}
export default GroupingIdControl;
