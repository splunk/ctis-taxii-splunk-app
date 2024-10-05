import {useEffect} from "react";
import {useFormContext} from "react-hook-form";

export const useFieldWatchesStateValue = ({fieldName, stateValue}) => {
    const formMethods = useFormContext();
    const {setValue} = formMethods;
    useEffect(() => {
        if (setValue && stateValue) {
            setValue(fieldName, stateValue, {shouldValidate: true});
        }
    }, [setValue, fieldName, stateValue]);
}
