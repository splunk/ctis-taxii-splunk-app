import React, {useState, useMemo} from "react";

export const useOnFormSubmit = ({formMethods, submitToPostEndpoint, submissionSuccessCallback, submissionErrorCallback}) => {
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);

    const {trigger, formState} = formMethods;

    const submitButtonDisabled = useMemo(() => Object.keys(formState.errors).length > 0 || formState.isSubmitting || submitSuccess,
        [formState, submitSuccess]);

    async function onSubmit(data) {
        setSubmissionError(null);
        setSubmitSuccess(false);

        console.log(data);
        const formIsValid = await trigger();
        if (formIsValid) {
            console.log("Form is valid");
            await submitToPostEndpoint(data, (resp) => {
                console.log(resp);
                setSubmitSuccess(true);
                if(submissionSuccessCallback){
                    submissionSuccessCallback(resp);
                }
            }, async (error_or_error_response) => {
                console.error("Error submitting form:", error_or_error_response);
                const error_object = {};
                if (error_or_error_response instanceof Error) {
                    error_object.error = error_or_error_response;
                }else{
                    error_object.response = {
                            status: error_or_error_response.status,
                            statusText: error_or_error_response.statusText,
                            ok: error_or_error_response.ok,
                    };

                    if (error_or_error_response?.headers?.get('content-type')?.includes('application/json')) {
                        error_object.json = await error_or_error_response.json();
                    }
                }
                setSubmissionError(error_object);
                if(submissionErrorCallback){
                    submissionErrorCallback(error_object);
                }
            });
        }else{
            console.error(formState.errors);
        }
    }
    return {submitSuccess, submissionError, submitButtonDisabled, onSubmit};
}
