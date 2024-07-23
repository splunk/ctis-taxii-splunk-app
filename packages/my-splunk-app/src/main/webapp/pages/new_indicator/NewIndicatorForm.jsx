import ControlGroup from "@splunk/react-ui/ControlGroup";
import Select from "@splunk/react-ui/Select";
import Text from "@splunk/react-ui/Text";
import TextArea from "@splunk/react-ui/TextArea";
import Number from "@splunk/react-ui/Number";
import {DateTimeWithTimezone} from "@splunk/my-react-component/src/DateTimeWithTimezone";
import React from "react";
import PropTypes from "prop-types";
import {useForm} from "react-hook-form";
import Button from "@splunk/react-ui/Button";

const GROUPING_ID = "groupingId";
const INDICATOR_ID = "indicatorId";
const SPLUNK_FIELD_NAME = "splunkFieldName";
const SPLUNK_FIELD_VALUE = "splunkFieldValue";

export function NewIndicatorForm({initialIndicatorId, initialSplunkFieldName, initialSplunkFieldValue}) {
    const {watch, handleSubmit, setValue, setError, clearErrors, formState: {errors}} = useForm({
        defaultValues: {
            [GROUPING_ID]: null,
            [INDICATOR_ID]: initialIndicatorId,
            [SPLUNK_FIELD_NAME] : initialSplunkFieldName,
            [SPLUNK_FIELD_VALUE] : initialSplunkFieldValue
        }
    });
    const groupingId = watch(GROUPING_ID);
    const indicatorId = watch(INDICATOR_ID);
    const splunkFieldName = watch(SPLUNK_FIELD_NAME);
    const splunkFieldValue = watch(SPLUNK_FIELD_VALUE);


    function onSubmit(data) {
        console.log(data);
    }

    function generateSetValueHandler(fieldName) {
        return (e, {value}) => setValue(fieldName, value);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ControlGroup label="Grouping ID">
                <Select value={groupingId} onChange={generateSetValueHandler(GROUPING_ID)}>
                    <Select.Option label="Grouping A" value="A"/>
                    <Select.Option label="Grouping B" value="B"/>
                </Select>
            </ControlGroup>
            <ControlGroup label="Indicator ID" help={errors?.indicatorId?.message} error={!!errors?.indicatorId}>
                <Text canClear value={indicatorId} onChange={(e, {value}) => {
                    setValue(INDICATOR_ID, value);
                    if (!value.startsWith('indicator--')) {
                        setError(INDICATOR_ID, {type: 'manual', message: 'Indicator ID must begin with "indicator--"'});
                    } else {
                        clearErrors(INDICATOR_ID)
                    }
                }}/>
            </ControlGroup>
            <ControlGroup label="Splunk Field Name">
                <Text canClear value={splunkFieldName} onChange={generateSetValueHandler(SPLUNK_FIELD_NAME)}/>
            </ControlGroup>
            <ControlGroup label="Splunk Field Value">
                <Text canClear value={splunkFieldValue} onChange={generateSetValueHandler(SPLUNK_FIELD_VALUE)}/>
            </ControlGroup>
            <ControlGroup label="Name">
                <Text canClear/>
            </ControlGroup>
            <ControlGroup label="Description">
                <TextArea/>
            </ControlGroup>
            <ControlGroup label="STIX v2 Pattern">
                <TextArea/>
            </ControlGroup>
            <ControlGroup label="Confidence">
                <Number defaultValue={100} max={100} min={0} step={1}/>
            </ControlGroup>
            <ControlGroup label="TLP Rating">
                <Select>
                    <Select.Option label="RED" value="RED"/>
                    <Select.Option label="AMBER" value="AMBER"/>
                    <Select.Option label="GREEN" value="GREEN"/>
                    <Select.Option label="WHITE" value="WHITE"/>
                </Select>
            </ControlGroup>
            <ControlGroup label="Valid From">
                <DateTimeWithTimezone/>
            </ControlGroup>
            <ControlGroup>
                <Button type="submit" label="Submit" appearance="primary" disabled={Object.keys(errors).length > 0}/>
            </ControlGroup>
            <p>Errors: {JSON.stringify(errors)}</p>
        </form>
    );
}

NewIndicatorForm.propTypes = {
    initialIndicatorId: PropTypes.string,
    initialSplunkFieldName: PropTypes.string,
    initialSplunkFieldValue: PropTypes.string,
};
