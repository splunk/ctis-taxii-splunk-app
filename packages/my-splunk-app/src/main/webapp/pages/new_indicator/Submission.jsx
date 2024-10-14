import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import {createSelector} from '@reduxjs/toolkit'

import {
    triggerValidationSignal as commonPropsTrigger,
    waitingForValidation as commonPropsWaitingForValidation
} from "./CommonProperties.slice";
import {
    triggerValidationSignal as indicatorsTrigger,
    waitingForValidation as indicatorsWaitingForValidation
} from "./Indicators.slice";

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

export default function Submission() {
    const commonProps = useSelector((state) => state.commonProperties.data);
    const indicators = useSelector((state) => state.indicators.indicators);
    const waiting = useSelector(waitingForValidation);

    const hasErrors = useSelector(hasErrorsSelector);

    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const dispatch = useDispatch();

    const {handleSubmit, setValue} = useForm({
        mode: 'all',
        defaultValues: {
            data: {}
        }
    })

    const submitToApi = useCallback(() => new Promise((resolve) => {
        console.log("Submitting to API...");
        setTimeout(() => {
            console.log("API call complete");
            setSubmitting(false);
            setSubmitSuccess(true);
            resolve();
        }, 3000);
    }), []);

    useEffect(() => {
        setValue('data', {
            ...commonProps,
            indicators: Object.values(indicators)
        })
    }, [setValue, commonProps, indicators])

    useEffect(() => {
        if (submitting && !waiting) {
            console.log("Finished validation. Errors:", hasErrors);
            if (hasErrors) {
                setSubmitting(false);
            } else {
                submitToApi().then();
            }
        }
    }, [submitToApi, waiting, submitting, hasErrors])

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
                <button disabled={submitting} type="submit">Submit</button>
                <span>{waiting ? "Waiting" : "Not Waiting"}</span>
                <span>{submitting ? "Submitting" : "Not submitting"}</span>
                {submitSuccess && <div>Submit Success</div>}
            </form>
        </section>
    )
}
