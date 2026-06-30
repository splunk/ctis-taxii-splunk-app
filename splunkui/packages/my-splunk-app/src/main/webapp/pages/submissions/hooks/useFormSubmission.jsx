import { errorToText, submitGrouping } from '@splunk/my-page/src/ApiClient';
import { useState } from 'react';
import { urlForViewSubmission } from '@splunk/my-page/src/urls';

export function useFormSubmission(trigger, formState) {
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);

    const onSubmit = async (data) => {
        console.log('Form data:', data);
        const formIsValid = await trigger();
        if (formIsValid) {
            console.log('Form is valid');
            await submitGrouping(
                data,
                (resp) => {
                    console.log(resp);
                    setSubmitSuccess(true);
                    window.location = urlForViewSubmission(resp.submission.submission_id);
                },
                (errorResponse) => {
                    console.error('Error submitting grouping', errorResponse);
                    errorToText(errorResponse).then((errorText) => {
                        setSubmissionError(errorText);
                    });
                },
            );
        } else {
            console.log('Form is not valid');
            console.error(formState.errors);
        }
    };
    return {submitSuccess, submissionError, onSubmit};
}
