import ControlGroup from "@splunk/react-ui/ControlGroup";
import {createRESTURL} from '@splunk/splunk-utils/url';
import {getCSRFToken} from '@splunk/splunk-utils/config';

import React from "react";

import PropTypes from "prop-types";
import {useForm} from "react-hook-form";
import Button from "@splunk/react-ui/Button";
import TextControlGroup from "./TextControlGroup";
import TextAreaControlGroup from "./TextAreaControlGroup";
import NumberControlGroup from "./NumberControlGroup";
import SelectControlGroup from "./SelectControlGroup";
import DatetimeControlGroup from "./DateTimeControlGroup";

const GROUPING_ID = "grouping_id";
const INDICATOR_ID = "indicator_id";
const SPLUNK_FIELD_NAME = "splunk_field_name";
const SPLUNK_FIELD_VALUE = "splunk_field_value";
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
            [TLP_RATING]: "GREEN",
            [VALID_FROM]: new Date().toISOString().slice(0, -1),
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
    register(VALID_FROM, {required: "Valid from is required."});

    const onSubmit = async (data) => {
        console.log(data);
        await trigger();

        // Custom CSRF headers set for POST requests to custom endpoints
        // See https://docs.splunk.com/Documentation/StreamApp/7.1.3/DeployStreamApp/SplunkAppforStreamRESTAPI
        const resp = await fetch(createRESTURL('create-indicator', {app: 'TA_CTIS_TAXII_ES_AR_2'}),
            {
                method: 'POST', body: JSON.stringify(data), headers: {
                    'X-Splunk-Form-Key': getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
        console.log(resp)
    }

    function generateSetValueHandler(fieldName) {
        return (e, extra) => {
            // In vanilla JS change events only a single event parameter is passed
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event#examples
            // However for Splunk UI onChange events two values are passed: (event, {name, value})
            // See code in the examples: https://splunkui.splunk.com/Packages/react-ui/Select?section=examples
            const value = extra?.value || e.target.value;
            console.log(e, extra, value)
            setValue(fieldName, value, {shouldValidate: true})
        };
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
            <DatetimeControlGroup label="Valid From (UTC)" {...formInputProps(VALID_FROM)}/>
            <ControlGroup label="Submit">
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
