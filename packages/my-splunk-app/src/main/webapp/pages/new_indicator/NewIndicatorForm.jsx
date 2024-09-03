import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import {listIndicatorCategories, postCreateIndicator} from "@splunk/my-react-component/src/ApiClient";

import React, {useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";
import {FormProvider, useFieldArray, useForm} from "react-hook-form";
import styled from "styled-components";

import Button from "@splunk/react-ui/Button";
import Modal from '@splunk/react-ui/Modal';
import P from '@splunk/react-ui/Paragraph';
import Message from '@splunk/react-ui/Message';


import {VIEW_INDICATORS_PAGE} from "@splunk/my-react-component/src/urls";
import NumberControlGroup from "@splunk/my-react-component/src/NumberControlGroup";
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import DatetimeControlGroup from "@splunk/my-react-component/src/DateTimeControlGroup";

import SubmitButton from "./SubmitButton";
import {IndicatorSubForm} from "./IndicatorSubForm";

const GROUPING_ID = "grouping_id";
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

const newIndicatorObject = () => ({
    field_name : '',
    indicator_value: '',
    indicator_category: '',
    stix_pattern: '',
    name: '',
    description: '',
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
    const {fields, append, remove} = useFieldArray({
        control,
        name: 'indicators'
    });
    const indicators = watch('indicators');

    const eventFieldNames = Object.keys(event || {});
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const submitButtonDisabled = useMemo(() => Object.keys(formState.errors).length > 0 || formState.isSubmitting || submitSuccess,
        [submitSuccess, formState]);
    const [submissionError, setSubmissionError] = useState(null);


    register(GROUPING_ID, {required: "Grouping ID is required."});
    const groupingId = watch(GROUPING_ID);

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

    const [indicatorCategories, setIndicatorCategories] = useState([]);
    useEffect(() => {
        listIndicatorCategories(null, null, (resp) => {
            console.log(resp);
            setIndicatorCategories(resp.categories.map((category) => ({label: category, value: category})));
        }, console.error);
    }, []);

    return (
        <FormProvider {...methods}>
            <MyForm name="newIndicator" onSubmit={handleSubmit(onSubmit)}>
                {submissionError &&
                    <Message appearance="fill" type="error" onRequestRemove={() => setSubmissionError(null)}>
                        {submissionError}
                    </Message>}
                <SelectControlGroup label="Grouping ID" {...formInputProps(GROUPING_ID)} options={[
                    {label: "Grouping A", value: "A"},
                    {label: "Grouping B", value: "B"}
                ]}/>

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
                                      removeSelf={() => remove(index)}
                                      indicatorCategories={indicatorCategories}/>)
                }
                <CustomControlGroup label="">
                    <Button label='Add another IoC' onClick={() => append(newIndicatorObject())}/>
                </CustomControlGroup>

                <SubmitButton disabled={submitButtonDisabled} submitting={formState.isSubmitting} numIndicators={indicators.length}/>
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
                <div style={{color: 'green'}}>
                    <code>
                        {JSON.stringify(indicators)}
                    </code>
                </div>
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

NewIndicatorForm.propTypes = {
    initialSplunkFieldName: PropTypes.string,
    initialSplunkFieldValue: PropTypes.string,
};
