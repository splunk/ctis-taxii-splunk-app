import {useEffect} from "react";
import {useFormContext} from "react-hook-form";

export const useFieldWatchesStateValue = ({fieldName, stateValue, onChangeHook}) => {
    const formMethods = useFormContext();
    const {setValue} = formMethods;
    useEffect(() => {
        if (setValue && stateValue) {
            setValue(fieldName, stateValue, {shouldValidate: true});
            if(onChangeHook) {
                setTimeout(() => onChangeHook(stateValue), 100);
            }
        }
    }, [setValue, fieldName, stateValue, onChangeHook]);
}

export const usePageTitle = (title) => {
    useEffect(() => {
        document.title = title;
    }, [title]);
}
