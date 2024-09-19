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

export const useFormInputProps = (formMethods, fieldName) => {
    const {formState, watch, setValue} = formMethods;
    const {errors} = formState;
    const error = findErrorMessage(errors, fieldName);
    return {
        help: error,
        error: !!error,
        onChange: generateSetValueHandler(setValue, fieldName),
        value: watch(fieldName)
    }
}
