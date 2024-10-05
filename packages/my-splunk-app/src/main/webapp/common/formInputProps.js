import {useFormContext} from "react-hook-form";
import {useEffect, useState} from "react";

function findErrorMessageInFlatObject(flatObject, refName) {
    // If the value is an object, check its ref
    if (typeof flatObject === 'object' && !Array.isArray(flatObject)) {
        if (flatObject?.ref?.name === refName) {
            return flatObject.message;
        }
    }
    return null;
}

function findErrorMessageInArray(array, refName) {
    if(!Array.isArray(array)) {
        return null;
    }
    const mapping = array.map((item) => {
        const findInObject = Object.values(item).map((value) => {
            return findErrorMessageInFlatObject(value, refName);
        })
        return findInObject.find((value) => value !== null) || null;
    });
    return mapping.find((value) => value !== null) || null;
}

export function findErrorMessage(validationObject, refName) {
    const mapping = Object.values(validationObject).map((value) => {
        const tryFlatObject = findErrorMessageInFlatObject(value, refName);
        if (tryFlatObject) {
            return tryFlatObject;
        }

        if (Array.isArray(value)) {
            const tryArray = findErrorMessageInArray(value, refName);
            if (tryArray) {
                return tryArray;
            }
        }
        return null;
    });
    return mapping.find((value) => value !== null) || null;
}

function generateSetValueHandler(setValue, fieldName) {
    return (e, extra) => {
        // In vanilla JS change events only a single event parameter is passed
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event#examples
        // However for Splunk UI onChange events two values are passed: (event, {name, value})
        // See code in the examples: https://splunkui.splunk.com/Packages/react-ui/Select?section=examples
        const extraValue = extra?.value;
        const value = (extraValue !== null && extraValue !== undefined) ? extraValue : e?.target?.value;
        console.log(e, extra, value)
        setValue(fieldName, value, {shouldValidate: true})
    };
}

export const useFormInputProps = (fieldName) => {
    const methodsViaHook = useFormContext();
    const [returnProps, setReturnProps] = useState({});
    useEffect(() => {
        if (methodsViaHook !== null) {
            const {formState, watch, setValue} = methodsViaHook;
            const {errors} = formState;
            const error = findErrorMessage(errors, fieldName);
            setReturnProps({
                error,
                onChange: generateSetValueHandler(setValue, fieldName),
                value: watch(fieldName)
            });
        }
    }, [fieldName, methodsViaHook]);
    return returnProps;
}
