import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import {postCreateIndicator, listIndicatorCategories} from "@splunk/my-react-component/src/ApiClient";

import React, {useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";
import {useForm} from "react-hook-form";
import styled from "styled-components";

import Button from "@splunk/react-ui/Button";
import Modal from '@splunk/react-ui/Modal';
import P from '@splunk/react-ui/Paragraph';
import Message from '@splunk/react-ui/Message';


import {VIEW_INDICATORS_PAGE} from "@splunk/my-react-component/src/urls";

import {useDebounce} from "@splunk/my-react-component/src/debounce";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import TextAreaControlGroup from "@splunk/my-react-component/src/TextAreaControlGroup";
import NumberControlGroup from "@splunk/my-react-component/src/NumberControlGroup";
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import DatetimeControlGroup from "@splunk/my-react-component/src/DateTimeControlGroup";
import StixPatternControlGroup from "@splunk/my-react-component/src/StixPatternControlGroup";

import SubmitButton from "./SubmitButton";
import {suggestPattern} from "./patternSuggester";

const GROUPING_ID = "grouping_id";
const INDICATOR_CATEGORY = "indicator_category";
const SPLUNK_FIELD_NAME = "splunk_field_name";
const SPLUNK_FIELD_VALUE = "splunk_field_value";
const NAME = "name";
const DESCRIPTION = "description";
const STIX_PATTERN = "stix_pattern";
const CONFIDENCE = "confidence";
const TLP_RATING = "tlp_v1_rating";
const VALID_FROM = "valid_from";


function GotoIndicatorsPageButton() {
    // TODO: this should probs change to viewing the indicator created?
    return (<Button to={VIEW_INDICATORS_PAGE} appearance="secondary" label="Go to Indicators"/>);
}

function GotoGroupingPageButton({groupingId}) {
    return (<Button to={`#${groupingId}`} appearance="primary" label={`Go to Grouping ${groupingId}`}/>);
}

const MyForm = styled.form`
    max-width: 1000px;
`

export function NewIndicatorForm({initialSplunkFieldName, initialSplunkFieldValue}) {
    const {watch, handleSubmit, setValue, getValues, trigger, register, formState, reset} = useForm({
        mode: 'all',
        defaultValues: {
            [GROUPING_ID]: null,
            [INDICATOR_CATEGORY]: "",
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
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const submitButtonDisabled = useMemo(() => Object.keys(formState.errors).length > 0 || formState.isSubmitting || submitSuccess,
        [submitSuccess, formState]);
    const [submissionError, setSubmissionError] = useState(null);


    register(GROUPING_ID, {required: "Grouping ID is required."});
    const groupingId = watch(GROUPING_ID);

    register(INDICATOR_CATEGORY, {required: "Indicator Category is required."});
    const indicatorCategory = watch(INDICATOR_CATEGORY);

    register(SPLUNK_FIELD_NAME, {required: "Splunk Field Name is required."});
    const splunkFieldName = watch(SPLUNK_FIELD_NAME);

    register(SPLUNK_FIELD_VALUE, {required: "Splunk Field Value is required."});
    const splunkFieldValue = watch(SPLUNK_FIELD_VALUE);

    register(NAME, {required: "Name is required."});
    register(DESCRIPTION, {required: "Description is required."});

    register(STIX_PATTERN, {required: "STIX Pattern is required."});
    const stixPattern = watch(STIX_PATTERN);

    register(TLP_RATING, {required: "TLP Rating is required."});
    register(CONFIDENCE, {required: "Confidence is required."});
    register(VALID_FROM, {required: "Valid from is required."});

    const onSubmit = async (data) => {
        console.log(data);
        const formIsValid = await trigger();
        setSubmissionError(null);
        if (formIsValid) {
            await postCreateIndicator(data, (resp) => {
                console.log(resp);
                setSubmitSuccess(true);
                setSubmissionError(null);
            }, async (error) => {
                const error_json = await error.json();
                console.error("Error creating indicator", error_json);
                setSubmissionError(error_json.error);
            });
        } else {
            console.error(formState.errors);
        }
    }

    function generateSetValueHandler(fieldName) {
        return (e, extra) => {
            // In vanilla JS change events only a single event parameter is passed
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event#examples
            // However for Splunk UI onChange events two values are passed: (event, {name, value})
            // See code in the examples: https://splunkui.splunk.com/Packages/react-ui/Select?section=examples
            const extraValue = extra?.value;
            const value = extraValue !== null && extraValue !== undefined ? extraValue : e.target.value;
            console.log(e, extra, value)
            setValue(fieldName, value, {shouldValidate: true})
        };
    }

    const formInputProps = (fieldName) => {
        const {errors} = formState;
        return {
            help: errors?.[fieldName]?.message,
            error: !!errors?.[fieldName],
            onChange: generateSetValueHandler(fieldName),
            value: watch(fieldName)
        }
    }

    const [suggestedPattern, setSuggestedPattern] = useState(null);
    const debounceSplunkFieldValue = useDebounce(splunkFieldValue, 1000);

    // TODO: use this for suggesting the Indicator category
    const debounceSplunkFieldName = useDebounce(splunkFieldName, 300);

    useEffect(() => {
        suggestPattern(indicatorCategory, splunkFieldValue, setSuggestedPattern);
    }, [indicatorCategory, debounceSplunkFieldValue]);

    useEffect(() => {
        if(stixPattern === "" && suggestedPattern){
            setValue(STIX_PATTERN, suggestedPattern, {shouldValidate: true});
        }
    }, [suggestedPattern]);

    const [indicatorCategories, setIndicatorCategories] = useState([]);
    useEffect(() => {
        listIndicatorCategories(splunkFieldName, splunkFieldValue, (resp) => {
            console.log(resp);
            setIndicatorCategories(resp.categories.map((category) => ({label: category, value: category})));
        }, console.error);
    }, [splunkFieldName, splunkFieldValue]);


    return (
        <MyForm name="newIndicator" onSubmit={handleSubmit(onSubmit)}>
            {submissionError && <Message appearance="fill" type="error" onRequestRemove={() => setSubmissionError(null)}>
                {submissionError}
            </Message>}
            <SelectControlGroup label="Grouping ID" {...formInputProps(GROUPING_ID)} options={[
                {label: "Grouping A", value: "A"},
                {label: "Grouping B", value: "B"}
            ]}/>
            <SelectControlGroup label="Indicator Category" {...formInputProps(INDICATOR_CATEGORY)} options={indicatorCategories}/>
            <TextControlGroup label="Splunk Field Name" {...formInputProps(SPLUNK_FIELD_NAME)} />
            <TextControlGroup label="Splunk Field Value" {...formInputProps(SPLUNK_FIELD_VALUE)} />
            <TextControlGroup label="Indicator Name" {...formInputProps(NAME)} />
            <TextAreaControlGroup label="Description" {...formInputProps(DESCRIPTION)} />
            <StixPatternControlGroup label="STIX v2 Pattern" {...formInputProps(STIX_PATTERN)}
                                     useSuggestedPattern={() => setValue(STIX_PATTERN, suggestedPattern, {shouldValidate: true})}
                                     suggestedPattern={suggestedPattern}
            />

            <NumberControlGroup label="Confidence" {...formInputProps(CONFIDENCE)} max={100} min={0} step={1}/>
            <SelectControlGroup label="TLP v1.0 Rating" {...formInputProps(TLP_RATING)} options={[
                {label: "RED", value: "RED"},
                {label: "AMBER", value: "AMBER"},
                {label: "GREEN", value: "GREEN"},
                {label: "WHITE", value: "WHITE"}
            ]}/>
            <DatetimeControlGroup label="Valid From (UTC)" {...formInputProps(VALID_FROM)}/>
            <CustomControlGroup label="">
                <SubmitButton disabled={submitButtonDisabled} submitting={formState.isSubmitting}/>
            </CustomControlGroup>
            {/*// TODO: Move Modal to a separate component*/}
            <Modal open={submitSuccess}>
                <Modal.Header
                    title="Successfully Created New Indicator"
                />
                <Modal.Body>
                    <P>To submit this IoC to CTIS, proceed to submit the Grouping.</P>
                    <GotoIndicatorsPageButton/>
                    <GotoGroupingPageButton groupingId={groupingId}/>
                </Modal.Body>
            </Modal>
        </MyForm>
    );
}

NewIndicatorForm.propTypes = {
    initialSplunkFieldName: PropTypes.string,
    initialSplunkFieldValue: PropTypes.string,
};
