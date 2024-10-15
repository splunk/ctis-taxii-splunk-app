import {useDispatch} from "react-redux";
import {useCallback, useEffect, useState} from "react";

export function errorSubset(error) {
    return {
        type: error.type,
        message: error.message
    }
}

export function errorsWithoutRef(errors) {
    return Object.keys(errors).reduce((acc, key) => {
        acc[key] = errorSubset(errors[key]);
        return acc;
    }, {});
}

export function useRespondToValidationSignal({validationSignal, formErrors, trigger, validationDoneActionCreator}) {
    const dispatch = useDispatch();
    const [lastValidationSignal, setLastValidationSignal] = useState(null);
    const performValidation = useCallback(async () => {
        await trigger();
        setLastValidationSignal(validationSignal);
    }, [trigger, setLastValidationSignal, validationSignal]);

    useEffect(() => {
        if (validationSignal !== null) {
            performValidation().then();
        }
    }, [validationSignal, performValidation]);

    useEffect(() => {
        if (lastValidationSignal !== null) {
            validationDoneActionCreator({signal: lastValidationSignal});
        }
    }, [lastValidationSignal, validationDoneActionCreator]);

    useEffect(() => {
        if (lastValidationSignal !== null) {
            dispatch(validationDoneActionCreator({
                signal: lastValidationSignal,
                errors: errorsWithoutRef(formErrors)
            }));
        }
    }, [validationDoneActionCreator, formErrors, dispatch, lastValidationSignal]);
}
