import {useState, useMemo} from "react";

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
            }, async (errorOrErrorResp) => {
                console.error("Error submitting form:", errorOrErrorResp);
                const errorObject = {};
                if (errorOrErrorResp instanceof Error) {
                    errorObject.error = errorOrErrorResp;
                }else{
                    errorObject.response = {
                            status: errorOrErrorResp.status,
                            statusText: errorOrErrorResp.statusText,
                            ok: errorOrErrorResp.ok,
                    };

                    if (errorOrErrorResp?.headers?.get('content-type')?.includes('application/json')) {
                        errorObject.json = await errorOrErrorResp.json();
                    }
                }
                setSubmissionError(errorObject);
                if(submissionErrorCallback){
                    submissionErrorCallback(errorObject);
                }
            });
        }else{
            console.error(formState.errors);
        }
    }
    return {submitSuccess, submissionError, submitButtonDisabled, onSubmit};
}
