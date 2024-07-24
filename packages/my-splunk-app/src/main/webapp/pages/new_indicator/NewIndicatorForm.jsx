import ControlGroup from "@splunk/react-ui/ControlGroup";
import {DateTimeWithTimezone} from "@splunk/my-react-component/src/DateTimeWithTimezone";

import React from "react";

import PropTypes from "prop-types";
import {useForm} from "react-hook-form";
import Button from "@splunk/react-ui/Button";
import TextControlGroup from "./TextControlGroup";
import TextAreaControlGroup from "./TextAreaControlGroup";
import NumberControlGroup from "./NumberControlGroup";
import SelectControlGroup from "./SelectControlGroup";

const GROUPING_ID = "groupingId";
const INDICATOR_ID = "indicatorId";
const SPLUNK_FIELD_NAME = "splunkFieldName";
const SPLUNK_FIELD_VALUE = "splunkFieldValue";
const NAME = "name";
const DESCRIPTION = "description";
const STIX_PATTERN = "stix_pattern";
const CONFIDENCE = "confidence";
const TLP_RATING = "tlp_rating";
const VALID_FROM = "valid_from";

export function NewIndicatorForm({initialIndicatorId, initialSplunkFieldName, initialSplunkFieldValue}) {
    const {watch, handleSubmit, setValue, trigger, register, formState: {errors}} = useForm({
        defaultValues: {
            [GROUPING_ID]: null,
            [INDICATOR_ID]: initialIndicatorId,
            [SPLUNK_FIELD_NAME]: initialSplunkFieldName,
            [SPLUNK_FIELD_VALUE]: initialSplunkFieldValue,
            [NAME]: "",
            [DESCRIPTION]: "",
            [STIX_PATTERN]: "",
            [CONFIDENCE]: 100,
            [TLP_RATING]: "GREEN"
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
    register(NAME, {required: "Name is required."});
    register(DESCRIPTION, {required: "Description is required."});
    register(STIX_PATTERN, {required: "STIX Pattern is required."});
    register(TLP_RATING, {required: "TLP Rating is required."});
    register(CONFIDENCE, {required: "Confidence is required."});
    register(VALID_FROM );

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
            <SelectControlGroup label="Grouping ID" {...formInputProps(GROUPING_ID)} options={[
                {label: "Grouping A", value: "A"},
                {label: "Grouping B", value: "B"}
            ]}/>
            <TextControlGroup label="Indicator ID" {...formInputProps(INDICATOR_ID)} />
            <TextControlGroup label="Splunk Field Name" {...formInputProps(SPLUNK_FIELD_NAME)} />
            <TextControlGroup label="Splunk Field Value" {...formInputProps(SPLUNK_FIELD_VALUE)} />
            <TextControlGroup label="Name" {...formInputProps(NAME)} />
            <TextAreaControlGroup label="Description" {...formInputProps(DESCRIPTION)} />
            <TextAreaControlGroup label="STIX v2 Pattern" {...formInputProps(STIX_PATTERN)} />

            <NumberControlGroup label="Confidence" {...formInputProps(CONFIDENCE)} max={100} min={0} step={1}/>
            <SelectControlGroup label="TLP Rating" {...formInputProps(TLP_RATING)} options={[
                {label: "RED", value: "RED"},
                {label: "AMBER", value: "AMBER"},
                {label: "GREEN", value: "GREEN"},
                {label: "WHITE", value: "WHITE"}
            ]}/>
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
