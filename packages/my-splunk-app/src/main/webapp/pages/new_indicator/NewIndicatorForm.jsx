import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import {postCreateIndicator, listIndicatorCategories} from "@splunk/my-react-component/src/ApiClient";

import React, {useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";
import {useForm, useFieldArray, FormProvider, useFormContext} from "react-hook-form";
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
import ComboControlGroup from "@splunk/my-react-component/src/ComboControlGroup";

import SubmitButton from "./SubmitButton";
import {suggestPattern} from "./patternSuggester";
import Heading from "@splunk/react-ui/Heading";
import indicatorIdControlGroup from "@splunk/my-react-component/src/IndicatorIdControlGroup";

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
const IndicatorSection = styled.section`
    border: 1px solid black;
    padding: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
`

const newIndicatorObject = () => ({
    fieldName : '',
    indicatorValue: '',
    indicatorCategory: '',
    stixPattern: '',
});

export function NewIndicatorForm({initialSplunkFieldName, initialSplunkFieldValue, event}) {
    const methods = useForm({
        mode: 'all',
        defaultValues: {
            [GROUPING_ID]: null,
            [CONFIDENCE]: 100,
            [TLP_RATING]: "GREEN",
            [VALID_FROM]: new Date().toISOString().slice(0, -1),
            indicators: [newIndicatorObject()]
        }
    });
    const {watch, register, setValue, trigger, handleSubmit, formState, control} = methods;
    const {fields, append} = useFieldArray({
        control,
        name: 'indicators'
    });
    const eventFieldNames = Object.keys(event || {});
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const submitButtonDisabled = useMemo(() => Object.keys(formState.errors).length > 0 || formState.isSubmitting || submitSuccess,
        [submitSuccess, formState]);
    const [submissionError, setSubmissionError] = useState(null);


    register(GROUPING_ID, {required: "Grouping ID is required."});
    const groupingId = watch(GROUPING_ID);

    // register(INDICATOR_CATEGORY, {required: "Indicator Category is required."});
    // const indicatorCategory = watch(INDICATOR_CATEGORY);
    //
    // register(SPLUNK_FIELD_NAME, {required: "Splunk Field Name is required."});
    // const splunkFieldName = watch(SPLUNK_FIELD_NAME);
    //
    // register(SPLUNK_FIELD_VALUE, {required: "Splunk Field Value is required."});
    // const splunkFieldValue = watch(SPLUNK_FIELD_VALUE);
    //
    // register(NAME, {required: "Name is required."});
    // register(DESCRIPTION, {required: "Description is required."});
    //
    // register(STIX_PATTERN, {required: "STIX Pattern is required."});
    // const stixPattern = watch(STIX_PATTERN);

    register(TLP_RATING, {required: "TLP Rating is required."});
    register(CONFIDENCE, {required: "Confidence is required."});
    register(VALID_FROM, {required: "Valid from is required."});

    const onSubmit = async (data) => {
        debugger;
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

    function findErrorMessage(validationObject, refName) {
        // Iterate over each key in the flat validation object
        for (let key in validationObject) {
            const value = validationObject[key];

            // If the value is an object, check its ref
            if (typeof value === 'object' && !Array.isArray(value)) {
                if (value.ref && value.ref.name === refName) {
                    return value.message;
                }
            }

            // If the value is an array, iterate through its elements
            if (Array.isArray(value)) {
                for (let item of value) {
                    // Check if the item has a matching ref
                    for (let subKey in item) {
                        const subValue = item[subKey];
                        if (subValue.ref && subValue.ref.name === refName) {
                            return subValue.message;
                        }
                    }
                }
            }
        }

        // Return null if no matching refName is found
        return null;
    }

    const formInputProps = (fieldName) => {
        const {errors} = formState;
        const error = findErrorMessage(errors, fieldName);
        return {
            help: error,
            error: !!error,
            onChange: generateSetValueHandler(fieldName),
            value: watch(fieldName)
        }
    }

    // const [suggestedPattern, setSuggestedPattern] = useState(null);
    // const debounceSplunkFieldValue = useDebounce(splunkFieldValue, 500);
    //
    // // TODO: use this for suggesting the Indicator category
    // const debounceSplunkFieldName = useDebounce(splunkFieldName, 300);
    //
    // useEffect(() => {
    //     suggestPattern(indicatorCategory, splunkFieldValue, setSuggestedPattern);
    // }, [indicatorCategory, debounceSplunkFieldValue]);
    //
    // useEffect(() => {
    //     if(stixPattern === "" && suggestedPattern){
    //         setValue(STIX_PATTERN, suggestedPattern, {shouldValidate: true});
    //     }
    // }, [suggestedPattern]);
    //
    const [indicatorCategories, setIndicatorCategories] = useState([]);
    useEffect(() => {
        listIndicatorCategories(null, null, (resp) => {
            console.log(resp);
            setIndicatorCategories(resp.categories.map((category) => ({label: category, value: category})));
        }, console.error);
    }, []);
    //
    // useEffect(() => {
    //     setValue(SPLUNK_FIELD_VALUE, event[splunkFieldName]);
    // }, [splunkFieldName]);
    // useEffect(() => {
    //     setValue(DESCRIPTION, `Description of ${splunkFieldName}=${splunkFieldValue}`);
    //     setValue(NAME, `Indicator name of ${splunkFieldName}=${splunkFieldValue}`);
    // }, [splunkFieldName, splunkFieldValue]);

    return (
        <FormProvider {...methods}>
        <MyForm name="newIndicator" onSubmit={handleSubmit(onSubmit)}>
            {submissionError && <Message appearance="fill" type="error" onRequestRemove={() => setSubmissionError(null)}>
                {submissionError}
            </Message>}
            <SelectControlGroup label="Grouping ID" {...formInputProps(GROUPING_ID)} options={[
                {label: "Grouping A", value: "A"},
                {label: "Grouping B", value: "B"}
            ]}/>

            {/*<SelectControlGroup label="Indicator Category" {...formInputProps(INDICATOR_CATEGORY)} options={indicatorCategories}/>*/}
            {/*// If form triggered via workflow action then show field name dropdown*/}
            {/*<ComboControlGroup label="Splunk Field Name" {...formInputProps(SPLUNK_FIELD_NAME)} options={eventFieldNames}/>*/}
            {/*<TextControlGroup label="Indicator Value" {...formInputProps(SPLUNK_FIELD_VALUE)} />*/}
            {/*<TextControlGroup label="Indicator Name" {...formInputProps(NAME)} />*/}
            {/*<TextAreaControlGroup label="Description" {...formInputProps(DESCRIPTION)} />*/}
            {/*<StixPatternControlGroup label="STIX v2 Pattern" {...formInputProps(STIX_PATTERN)}*/}
            {/*                         useSuggestedPattern={() => setValue(STIX_PATTERN, suggestedPattern, {shouldValidate: true})}*/}
            {/*                         suggestedPattern={suggestedPattern}*/}
            {/*/>*/}

            <NumberControlGroup label="Confidence" {...formInputProps(CONFIDENCE)} max={100} min={0} step={1}/>
            <SelectControlGroup label="TLP v1.0 Rating" {...formInputProps(TLP_RATING)} options={[
                {label: "RED", value: "RED"},
                {label: "AMBER", value: "AMBER"},
                {label: "GREEN", value: "GREEN"},
                {label: "WHITE", value: "WHITE"}
            ]}/>
            <DatetimeControlGroup label="Valid From (UTC)" {...formInputProps(VALID_FROM)}/>

            {fields.map((field, index) =>
                <IndicatorSubForm field={field} index={index} register={register}
                                  generateFormInputProps={formInputProps}
                                  splunkEvent={event}
                indicatorCategories={indicatorCategories}/>)
            }
            <CustomControlGroup label="Add another IoC">
                <Button label='Add another IoC' onClick={() => append(newIndicatorObject())}/>
            </CustomControlGroup>


            <CustomControlGroup label="">
                <SubmitButton disabled={submitButtonDisabled} submitting={formState.isSubmitting}/>
                {/*<SubmitButton submitting={formState.isSubmitting}/>*/}
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
            <div style={{color: 'red'}}>
                <code>
                    {JSON.stringify(formState.errors)}
                </code>
            </div>
            <div>
                {event && <code>{JSON.stringify(event)}</code>}
            </div>
        </MyForm>
        </FormProvider>
    );
}
const IndicatorSubForm = ({field, index, generateFormInputProps, splunkEvent, indicatorCategories}) => {
    const {register, setValue, watch} = useFormContext();
    const splunkFields = Object.keys(splunkEvent || {});

    const fieldSplunkFieldName = `indicators.${index}.fieldName`;
    const fieldIndicatorValue = `indicators.${index}.indicatorValue`;
    const fieldIndicatorCategory = `indicators.${index}.indicatorCategory`;
    const fieldStixPattern = `indicators.${index}.stixPattern`;

    register(fieldSplunkFieldName);
    register(fieldIndicatorValue, {required: "Indicator Value is required."});
    register(fieldIndicatorCategory, {required: "Indicator Category is required."});
    register(fieldStixPattern, {required: "STIX Pattern is required."});

    const splunkFieldName = watch(fieldSplunkFieldName);
    const indicatorValue = watch(fieldIndicatorValue);
    const indicatorCategory = watch(fieldIndicatorCategory);
    const stixPattern = watch(fieldStixPattern);

    const [suggestedPattern, setSuggestedPattern] = useState(null);
    const debounceIndicatorValue = useDebounce(indicatorValue, 200);
    useEffect(() => {
        suggestPattern(indicatorCategory, indicatorValue, setSuggestedPattern);
    }, [indicatorCategory, debounceIndicatorValue]);

    useEffect(() => {
        if(stixPattern === "" && suggestedPattern){
            setValue(fieldStixPattern, suggestedPattern, {shouldValidate: true});
        }
    }, [suggestedPattern]);

    useEffect(() => {
        if (splunkEvent.hasOwnProperty(splunkFieldName)) {
            setValue(fieldIndicatorValue, splunkEvent[splunkFieldName]);
        }
    }, [splunkFieldName]);

    return <IndicatorSection key={field.id}>
        <Heading level={3} >New IoC {`#${index}`}</Heading>
        <ComboControlGroup label="Splunk Field Name" {...generateFormInputProps(fieldSplunkFieldName)} options={splunkFields}/>
        <TextControlGroup label="Indicator Value" {...generateFormInputProps(fieldIndicatorValue)} />
        <SelectControlGroup label="Indicator Category" {...generateFormInputProps(fieldIndicatorCategory)} options={indicatorCategories}/>
        <StixPatternControlGroup label="STIX v2 Pattern" {...generateFormInputProps(fieldStixPattern)}
                                 useSuggestedPattern={() => setValue(fieldStixPattern, suggestedPattern, {shouldValidate: true})}
                                 suggestedPattern={suggestedPattern}/>
    </IndicatorSection>
}

NewIndicatorForm.propTypes = {
    initialSplunkFieldName: PropTypes.string,
    initialSplunkFieldValue: PropTypes.string,
};
