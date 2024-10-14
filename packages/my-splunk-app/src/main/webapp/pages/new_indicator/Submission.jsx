import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import {createSelector} from '@reduxjs/toolkit'

import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import {HorizontalButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import SubmitButton from "@splunk/my-react-component/src/SubmitButton";
import {postCreateIndicator} from "@splunk/my-react-component/src/ApiClient";
import Modal from "@splunk/react-ui/Modal";
import P from "@splunk/react-ui/Paragraph";
import {SubmitGroupingButton} from "@splunk/my-react-component/src/buttons/SubmitGroupingButton";
import Button from "@splunk/react-ui/Button";
import {VIEW_INDICATORS_PAGE} from "@splunk/my-react-component/src/urls";
import {createToast} from "@splunk/my-react-component/src/AppContainer";
import {
    triggerValidationSignal as indicatorsTrigger,
    waitingForValidation as indicatorsWaitingForValidation
} from "./Indicators.slice";
import {
    triggerValidationSignal as commonPropsTrigger,
    waitingForValidation as commonPropsWaitingForValidation
} from "./CommonProperties.slice";
import {FIELD_GROUPING_ID} from "../../common/indicator_form/fieldNames";

const waitingForValidation = createSelector(
    [
        commonPropsWaitingForValidation,
        indicatorsWaitingForValidation
    ],
    (commonProps, indicators) => commonProps || indicators
)

const hasErrorsSelector = createSelector(
    [
        (state) => state.commonProperties.errors,
        (state) => state.indicators.errors
    ],
    (commonPropsErrors, indicatorsErrors) => {
        const hasCommonPropsErrors = Object.keys(commonPropsErrors).length > 0;
        const hasIndicatorsErrors = Object.values(indicatorsErrors).some(x => Object.keys(x).length > 0);
        return hasCommonPropsErrors || hasIndicatorsErrors;
    }
)

function GotoIndicatorsPageButton() {
    return (<Button to={VIEW_INDICATORS_PAGE} appearance="secondary" label="Go to Indicators"/>);
}

export default function Submission() {
    const commonProps = useSelector((state) => state.commonProperties.data);
    const groupingId = useSelector((state) => state.commonProperties.data[FIELD_GROUPING_ID]);

    const indicators = useSelector((state) => state.indicators.indicators);
    const numIndicators = Object.keys(indicators).length;

    const waiting = useSelector(waitingForValidation);

    const hasErrors = useSelector(hasErrorsSelector);

    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [sendToApiPromise, setSendToApiPromise] = useState(null);

    const dispatch = useDispatch();

    const {handleSubmit, setValue, watch} = useForm({
        mode: 'all',
        defaultValues: {
            data: {}
        }
    })
    const formData = watch('data');
    const debugMode = true;

    const submitToApi = useCallback(async (data) => {
        await postCreateIndicator(data, (resp) => {
            console.log("Response:", resp);
            setSubmitSuccess(true);
            setSubmitting(false);
            setSendToApiPromise(null);
        }, (error) => {
            console.error("Error submitting form to API:", error);
            setSubmitSuccess(false);
            setSubmitting(false);
            setSendToApiPromise(null);
        })
    }, []);

    useEffect(() => {
        setValue('data', {
            ...commonProps,
            indicators: Object.values(indicators)
        })
    }, [setValue, commonProps, indicators])

    useEffect(() => {
        if (submitting && !waiting && sendToApiPromise === null) {
            console.log("Finished validation. Errors:", hasErrors);
            if (hasErrors) {
                createToast({
                    type: 'error',
                    message: "The form has errors. Please correct them before submitting.",
                    autoDismiss: true
                })
                setSubmitting(false);
            } else {
                setSendToApiPromise(submitToApi(formData));
            }
        }
    }, [sendToApiPromise, setSendToApiPromise, formData, submitToApi, waiting, submitting, hasErrors])

    const onSubmit = (data) => {
        console.log("Submit:", data);
        // Note that dispatch calls are synchronous
        dispatch(commonPropsTrigger());
        dispatch(indicatorsTrigger());
        // set submitting to true after dispatching the validation triggers
        setSubmitting(true);
    }

    return (
        <section>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CustomControlGroup>
                    <HorizontalButtonLayout>
                        <SubmitButton inline disabled={submitting} submitting={submitting}/>
                    </HorizontalButtonLayout>
                </CustomControlGroup>
            </form>
            <Modal open={submitSuccess}>
                <Modal.Header
                    title={`Successfully Created New Indicator${numIndicators > 1 ? "s" : ""}`}
                />
                <Modal.Body>
                    <P>To submit to TAXII server, proceed to submit the Grouping.</P>
                    <GotoIndicatorsPageButton/>
                    <SubmitGroupingButton groupingId={groupingId}/>
                </Modal.Body>
            </Modal>
            {debugMode && <div>
                <div>{waiting ? "Waiting" : "Not Waiting"}</div>
                <div>{submitting ? "Submitting" : "Not submitting"}</div>
                {submitSuccess && <div>Submit Success</div>}
                <div>
                    <code>
                        {JSON.stringify(formData, null, 2)}
                    </code>
                </div>
            </div>}
        </section>
    )
}
