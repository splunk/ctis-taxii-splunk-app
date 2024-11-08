import {postCreateIndicator} from "@splunk/my-react-component/src/ApiClient";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";
import {FormProvider, useForm} from "react-hook-form";

import Button from "@splunk/react-ui/Button";
import Modal from '@splunk/react-ui/Modal';
import P from '@splunk/react-ui/Paragraph';
import PlusCircle from '@splunk/react-icons/PlusCircle';

import {VIEW_INDICATORS_PAGE} from "@splunk/my-react-component/src/urls";

import SubmitButton from "@splunk/my-react-component/src/SubmitButton";
import Heading from "@splunk/react-ui/Heading";
import Divider from "@splunk/react-ui/Divider";
import {dateNowInSecondsPrecision, dateToIsoStringWithoutTimezone} from "@splunk/my-react-component/src/date_utils";
import {HorizontalButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import BaseButton from "@splunk/my-react-component/src/BaseButton";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import {SubmitGroupingButton} from "@splunk/my-react-component/src/buttons/SubmitGroupingButton";
import Code from "@splunk/react-ui/Code";
import {v4 as uuidv4} from 'uuid';
import Message from "@splunk/react-ui/Message";
import {StyledForm} from "../../common/indicator_form/StyledForm";
import useIndicatorCategories from "../../common/indicator_form/indicatorCategories";
import {
    FIELD_CONFIDENCE,
    FIELD_GROUPING_ID,
    FIELD_INDICATORS,
    FIELD_TLP_RATING,
    FIELD_VALID_FROM,
    REGISTER_FIELD_OPTIONS
} from "../../common/indicator_form/fieldNames";
import {ValidFromField} from "../../common/indicator_form/formControls";
import {IndicatorSubForm} from "./IndicatorSubForm";
import {GroupingIdFieldV2} from "../../common/indicator_form/GroupingsDropdown";
import {TLPv2RatingField} from "../../common/tlp";
import {ConfidenceField} from "../../common/confidence";

function GotoIndicatorsPageButton() {
    // TODO: this should probs change to viewing the indicator created?
    return (<Button to={VIEW_INDICATORS_PAGE} appearance="secondary" label="Go to Indicators"/>);
}

const newIndicatorObject = ({splunk_field_name: splunkFieldName = '', indicator_value: indicatorValue = ''} = {}) => ({
    splunk_field_name: splunkFieldName,
    indicator_value: indicatorValue,
    indicator_category: '',
    stix_pattern: '',
    name: '',
    description: '',
});

function getErrorsByIndex(errorsArray, index) {
    if (!errorsArray) {
        return null;
    }

    // Find the error object that matches the given index
    const errorForIndex = errorsArray.find(error => error.index === index);

    // Check if the error object for the specified index exists
    if (!errorForIndex) {
        return null;
    }

    // Return the errors array for the specified index
    return [...errorForIndex.errors];
}

function useIndicatorsData() {
    const [indicatorIds, setIndicatorIds] = useState([]);
    const [indicatorIdToData, setIndicatorIdToData] = useState({});

    const addIndicator = useCallback(() => {
        console.log("Adding indicator");
        const newId = uuidv4();
        setIndicatorIds([...indicatorIds, newId]);
        setIndicatorIdToData({...indicatorIdToData, [newId]: newIndicatorObject()});
    }, [setIndicatorIdToData, indicatorIdToData, setIndicatorIds, indicatorIds]);

    const removeIndicator = useCallback((id) => {
        console.log("Removing indicator", id);
        setIndicatorIds(prev => prev.filter(indicatorId => indicatorId !== id));
        const copyOfIndicatorIdToData = {...indicatorIdToData};
        delete copyOfIndicatorIdToData[id];
        setIndicatorIdToData(copyOfIndicatorIdToData);
    }, [setIndicatorIds, setIndicatorIdToData, indicatorIdToData]);

    const updateIndicator = useCallback((id, delta) => {
        console.log("Updating indicator", id, delta);
        const newDelta = {...indicatorIdToData[id], ...delta};
        setIndicatorIdToData({...indicatorIdToData, [id]: newDelta});
    }, [indicatorIdToData, setIndicatorIdToData]);
    return {
        indicatorIds,
        setIndicatorIds,
        indicatorIdToData,
        setIndicatorIdToData,
        addIndicator,
        removeIndicator,
        updateIndicator
    };
}

function useSignal() {
    const [signal, setSignal] = useState(0);
    const incrementSignal = useCallback(() => setSignal(signal + 1), [signal, setSignal]);
    return {signal, incrementSignal};
}

function useValidationOrchestrator({indicatorIds}) {
    const {signal, incrementSignal} = useSignal();
    const [idToValidationErrors, setIdToValidationErrors] = useState({});
    const [idToValidationCallbacks, setIdToValidationCallbacks] = useState({});
    const [isValidating, setIsValidating] = useState(false);
    const [validationPromise, setValidationPromise] = useState(null);

    useEffect(() => {
        const mapping = {};
        indicatorIds.forEach(id => {
            const callback = (errors) => setIdToValidationErrors(prev => ({...prev, [id]: errors}));
            mapping[id] = callback;
        });
        setIdToValidationCallbacks(mapping);
    }, [setIdToValidationCallbacks, indicatorIds]);

    useEffect(() => {
        if (Object.keys(idToValidationErrors).length === indicatorIds.length) {
            setIsValidating(false);
        } else {
            setIsValidating(true);
        }
    }, [setIsValidating, isValidating, idToValidationErrors, indicatorIds]);

    useEffect(() => {
        if (validationPromise && !isValidating) {
            validationPromise.resolve(idToValidationErrors);
            setValidationPromise(null);
        }
    }, [validationPromise, isValidating, idToValidationErrors]);

    const triggerValidation = useCallback(async () => {
        console.log("Triggering validation");
        setIdToValidationErrors({}); // Clear all errors
        incrementSignal()
        return new Promise((resolve, reject) => {
            setValidationPromise({resolve, reject});
        });
    }, [setValidationPromise, incrementSignal, setIdToValidationErrors]);

    return {signal, idToValidationErrors, idToValidationCallbacks, triggerValidation, isValidating};
}

export function NewIndicatorForm({initialSplunkFieldName, initialSplunkFieldValue, event}) {
    console.log("NewIndicatorForm", initialSplunkFieldName, initialSplunkFieldValue, event);
    const methods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_GROUPING_ID]: null,
            [FIELD_CONFIDENCE]: 50,
            [FIELD_TLP_RATING]: "GREEN",
            [FIELD_VALID_FROM]: dateToIsoStringWithoutTimezone(dateNowInSecondsPrecision()),
            [FIELD_INDICATORS]: [
                // newIndicatorObject({
                //     splunk_field_name: initialSplunkFieldName,
                //     indicator_value: initialSplunkFieldValue
                // })
            ]
        }
    });
    const {watch, register, trigger, handleSubmit, formState} = methods;

    const [submitSuccess, setSubmitSuccess] = useState(false);
    const submitButtonDisabled = useMemo(() => Object.keys(formState.errors).length > 0 || formState.isSubmitting || submitSuccess,
        [submitSuccess, formState]);
    const [submissionSubErrors, setSubmissionSubErrors] = useState(null);
    const [submissionError, setSubmissionError] = useState(null);

    [FIELD_GROUPING_ID, FIELD_TLP_RATING, FIELD_CONFIDENCE, FIELD_VALID_FROM, FIELD_INDICATORS].forEach(fieldName => {
        register(fieldName, REGISTER_FIELD_OPTIONS[fieldName]);
    });

    const groupingId = watch(FIELD_GROUPING_ID);
    const {indicatorIds, indicatorIdToData, addIndicator, removeIndicator, updateIndicator} = useIndicatorsData();
    const {
        signal: validationSignal,
        idToValidationErrors,
        idToValidationCallbacks,
        triggerValidation
    } = useValidationOrchestrator({indicatorIds});

    const anySubformHasErrors = (subformErrors) => {
        const filtered = Object.values(subformErrors).filter(errors => Object.keys(errors).length > 0);
        return filtered.length > 0;
    }

    const onSubmit = async (data) => {
        console.log(data);
        const mainFormIsValid = await trigger();

        const subformErrors = await triggerValidation();
        const subformsAreValid = !anySubformHasErrors(subformErrors);

        setSubmissionSubErrors(null);
        if (mainFormIsValid && subformsAreValid) {
            await postCreateIndicator(data, (resp) => {
                console.log(resp);
                setSubmitSuccess(true);
                setSubmissionSubErrors(null);
            }, async (errorResponse) => {
                debugger; // eslint-disable-line no-debugger
                const errorJson = await errorResponse.json();
                console.error("Error creating indicator", errorJson);
                setSubmissionSubErrors(errorJson.errors);
                setSubmissionError(String(errorJson.error));
            });
        } else {
            console.error("Main form errors", formState.errors);
            console.error("Subform errors", subformErrors);
        }
    }

    const onFormSubmitError = async (error) => {
        console.error("Error submitting form", error);
    }

    useEffect(() => {
        if (formState.errors && Object.keys(formState.errors).length > 0) {
            console.error(formState.errors)
        }
    }, [formState])

    const {indicatorCategories} = useIndicatorCategories();
    const formValues = watch();

    return (
        <FormProvider {...methods}>
            <StyledForm name="newIndicator" onSubmit={handleSubmit(onSubmit, onFormSubmitError)}>
                <section>
                    <Heading level={2}>Common Properties</Heading>
                    <P>These properties will be shared by all indicators created on this form.</P>
                    <GroupingIdFieldV2 fieldName={FIELD_GROUPING_ID}/>
                    <ConfidenceField fieldName={FIELD_CONFIDENCE}/>
                    <TLPv2RatingField fieldName={FIELD_TLP_RATING}/>
                    <ValidFromField fieldName={FIELD_VALID_FROM}/>
                </section>
                <Divider/>
                {indicatorIds.map((indicatorId, index) =>
                    <IndicatorSubForm key={indicatorId}
                                      id={indicatorId}
                                      index={index}
                                      validationSignal={validationSignal}
                                      onValidationError={idToValidationCallbacks[indicatorId]}
                                      updateIndicator={(delta) => updateIndicator(indicatorId, delta)}
                                      splunkEvent={event}
                                      removeSelf={() => removeIndicator(indicatorId)}
                                      indicatorCategories={indicatorCategories}
                                      submissionErrors={getErrorsByIndex(submissionSubErrors, index)}/>
                )}
                <CustomControlGroup>
                    <HorizontalButtonLayout>
                        <BaseButton appearance="secondary" icon={<PlusCircle/>} inline label='Add Another Indicator'
                                    onClick={() => addIndicator()}/>
                        <SubmitButton inline disabled={submitButtonDisabled} submitting={formState.isSubmitting}
                                      label={`Create Indicators (${indicatorIds?.length})`}/>
                    </HorizontalButtonLayout>
                </CustomControlGroup>
                {submissionError && <Message appearance="fill" type="error">
                    ERROR: {submissionError}
                </Message>}
                <Modal open={submitSuccess}>
                    <Modal.Header
                        title={`Successfully Created New Indicator${indicatorIds?.length > 1 ? "s" : ""}`}
                    />
                    <Modal.Body>
                        <P>To submit to TAXII server, proceed to submit the Grouping.</P>
                        <GotoIndicatorsPageButton/>
                        <SubmitGroupingButton groupingId={groupingId}/>
                    </Modal.Body>
                </Modal>
                <Heading level={3}>Indicator IDs</Heading>
                <Code value={JSON.stringify(indicatorIds, null, 2)} language="json"/>
                <Heading level={3}>Indicator Data</Heading>
                <Code value={JSON.stringify(indicatorIdToData, null, 2)} language="json"/>
                <Heading level={3}>Subforms Indicator Validation Errors</Heading>
                <Code value={JSON.stringify(idToValidationErrors, null, 2)} language="json"/>
                <Heading level={3}>Form Values</Heading>
                <Code value={JSON.stringify(formValues, null, 2)} language="json"/>
                <Heading level={3}>Errors</Heading>
                <Code value={JSON.stringify(formState.errors, null, 2)} language="json"/>
            </StyledForm>
        </FormProvider>
    );
}

NewIndicatorForm.propTypes = {
    initialSplunkFieldName: PropTypes.string,
    initialSplunkFieldValue: PropTypes.string,
    event: PropTypes.object
};
