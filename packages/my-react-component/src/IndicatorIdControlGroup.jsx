import Text from "@splunk/react-ui/Text";
import React from "react";
import PropTypes from "prop-types";
import {CustomControlGroup} from "./CustomControlGroup";
import ButtonGroup from '@splunk/react-ui/ButtonGroup';
import Button from '@splunk/react-ui/Button';
import Switch from '@splunk/react-ui/Switch';


// Experiment with https://splunkui.splunk.com/Packages/react-ui/Switch?section=examples instead of ButtonGroup
const IndicatorIdControlGroup = ({label, value, onChange, help, error, useCustomIndicatorId, setUseCustomIndicatorId}) => {
    return (
        <CustomControlGroup label={label} help={help} error={error}>
            <ButtonGroup>
                <Button appearance="secondary" label="Auto-generated" selected={!useCustomIndicatorId} onClick={() => setUseCustomIndicatorId(false)}/>
                <Button appearance="secondary" label="Custom" selected={useCustomIndicatorId} onClick={() => setUseCustomIndicatorId(true)}/>
            </ButtonGroup>
            <Text canClear value={value} onChange={onChange} error={error} disabled={!useCustomIndicatorId}/>
        </CustomControlGroup>
    );

}
IndicatorIdControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string
}

export default IndicatorIdControlGroup;
