import {useFormContext} from "react-hook-form";
import {useEffect, useState} from "react";

function findErrorMessageInFlatObject(flatObject, refName) {
    // If the value is an object, check its ref
    if (flatObject && typeof flatObject === 'object' && !Array.isArray(flatObject)) {
        return flatObject?.[refName]?.message || null;
    }
    return null;
}

export function findErrorMessage(validationObject, fieldName) {
    // TODO: rename refName to fieldName
    // split fieldName by '.' into parts
    // e.g. indicators.1.description -> ['indicators', '1', 'description']
    // extract the index and the field name
    // WARNING: ignore ref.name in the validationObject because it can be misleading in terms of the index number
    // instead, go by the index in the array
    const tokens = fieldName.split('.');
    if (tokens.length === 3) {
        const arrayFieldName = tokens[0];
        const index = parseInt(tokens[1], 10);
        const recordFieldName = tokens[2];
        if (!validationObject[arrayFieldName]) {
            return null;
        }
        if (Array.isArray(validationObject[arrayFieldName])) {
            const records = validationObject[arrayFieldName];
            if (index >= 0 && index < records.length) {
                const record = records[index];
                const errorMessage = record?.[recordFieldName]?.message;
                return errorMessage || null;
            }
            console.warn(`Index ${index} out of bounds for ${arrayFieldName} in validationObject`);
            return null;
        }
        console.warn(`Field ${arrayFieldName} is not an array in validationObject: ${JSON.stringify(validationObject)}`);
        return null;

    }

    if (tokens.length === 1) {
        return findErrorMessageInFlatObject(validationObject, fieldName);
    }
    throw new Error(`Invalid fieldName ${fieldName}, expecting either a flat field name (no periods) or an array field name (3 periods)`);
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
