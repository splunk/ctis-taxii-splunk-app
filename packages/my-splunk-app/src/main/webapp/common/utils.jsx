import {useEffect} from "react";

export const useFieldWatchesStateValue = ({formMethods, fieldName, stateValue}) => {
    const {setValue} = formMethods;
    useEffect(() => {
        if (stateValue) {
            setValue(fieldName, stateValue, {shouldValidate: true});
        }
    }, [stateValue]);
}
