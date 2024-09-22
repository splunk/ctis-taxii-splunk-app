import {useEffect} from "react";
import {useFormContext} from "react-hook-form";

export const useFieldWatchesStateValue = ({fieldName, stateValue}) => {
    const formMethods = useFormContext();
    useEffect(() => {
        if (formMethods && stateValue) {
            const {setValue} = formMethods;
            setValue(fieldName, stateValue, {shouldValidate: true});
        }
    }, [stateValue]);
}
