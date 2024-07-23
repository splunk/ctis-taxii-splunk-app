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
import IndicatorIdControl from "./IndicatorIdControl";
import GroupingIdControl from "./GroupingIdControl";
import TextControlGroup from "./TextControlGroup";

const GROUPING_ID = "groupingId";
const INDICATOR_ID = "indicatorId";
const SPLUNK_FIELD_NAME = "splunkFieldName";
const SPLUNK_FIELD_VALUE = "splunkFieldValue";

export function NewIndicatorForm({initialIndicatorId, initialSplunkFieldName, initialSplunkFieldValue}) {
    const {watch, handleSubmit, setValue, trigger, register, formState: {errors}} = useForm({
        defaultValues: {
            [GROUPING_ID]: null,
            [INDICATOR_ID]: initialIndicatorId,
            [SPLUNK_FIELD_NAME]: initialSplunkFieldName,
            [SPLUNK_FIELD_VALUE]: initialSplunkFieldValue
        }
    });

    register(GROUPING_ID, {required: "Grouping ID is required."});
    register(INDICATOR_ID, {
        required: "Indicator ID is required.", pattern: {
            value: /indicator--.{36,}/,
            message: "Indicator ID must be 'indicator--' followed by a UUID."
        }
    });
    register(SPLUNK_FIELD_NAME, {required: "Splunk Field Name is required."});
    register(SPLUNK_FIELD_VALUE, {required: "Splunk Field Value is required."});

    const onSubmit = async (data) => {
        console.log(data);
        await trigger(); // TODO can this be removed?
    }

    function generateSetValueHandler(fieldName) {
        return (e, {value}) => setValue(fieldName, value, {shouldValidate: true});
    }

    const formInputProps = (fieldName) => {
        return {
            help: errors?.[fieldName]?.message,
            error: !!errors?.[fieldName],
            onChange: generateSetValueHandler(fieldName),
            value: watch(fieldName)
        }
    }

    return (
        <form name="newIndicator" onSubmit={handleSubmit(onSubmit)}>
            <GroupingIdControl {...formInputProps(GROUPING_ID)}/>
            <IndicatorIdControl {...formInputProps(INDICATOR_ID)} />
            <TextControlGroup label="Splunk Field Name" {...formInputProps(SPLUNK_FIELD_NAME)} />
            <TextControlGroup label="Splunk Field Value" {...formInputProps(SPLUNK_FIELD_VALUE)} />

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
