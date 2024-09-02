import {useFormContext} from "react-hook-form";
import React, {useEffect, useState} from "react";
import {useDebounce} from "@splunk/my-react-component/src/debounce";
import {suggestPattern} from "./patternSuggester";
import Heading from "@splunk/react-ui/Heading";
import ComboControlGroup from "@splunk/my-react-component/src/ComboControlGroup";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import StixPatternControlGroup from "@splunk/my-react-component/src/StixPatternControlGroup";
import {IndicatorSection} from "./IndicatorSection";
import TextAreaControlGroup from "@splunk/my-react-component/src/TextAreaControlGroup";

// TODO: remove generateFormInputProps as prop. This functionality can be done by using the useFormContext hook.
export const IndicatorSubForm = ({field, index, generateFormInputProps, splunkEvent, indicatorCategories}) => {
    const {register, setValue, watch} = useFormContext();
    const splunkFields = Object.keys(splunkEvent || {});

    const fieldSplunkFieldName = `indicators.${index}.field_name`;
    const fieldIndicatorValue = `indicators.${index}.indicator_value`;
    const fieldIndicatorCategory = `indicators.${index}.indicator_category`;
    const fieldIndicatorName = `indicators.${index}.name`;
    const fieldIndicatorDescription = `indicators.${index}.description`;
    const fieldStixPattern = `indicators.${index}.stix_pattern`;

    register(fieldSplunkFieldName);
    register(fieldIndicatorValue, {required: "Indicator Value is required."});
    register(fieldIndicatorCategory, {required: "Indicator Category is required."});
    register(fieldStixPattern, {required: "STIX Pattern is required."});
    register(fieldIndicatorName, {required: "Indicator Name is required."});
    register(fieldIndicatorDescription, {required: "Indicator Description is required."});

    const splunkFieldName = watch(fieldSplunkFieldName);
    const indicatorValue = watch(fieldIndicatorValue);
    const indicatorCategory = watch(fieldIndicatorCategory);
    const stixPattern = watch(fieldStixPattern);

    const [suggestedPattern, setSuggestedPattern] = useState(null);
    const debounceIndicatorValue = useDebounce(indicatorValue, 200);
    useEffect(() => {
        suggestPattern(indicatorCategory, indicatorValue, setSuggestedPattern);
    }, [indicatorCategory, debounceIndicatorValue]);

    useEffect(() => {
        if (stixPattern === "" && suggestedPattern) {
            setValue(fieldStixPattern, suggestedPattern, {shouldValidate: true});
        }
    }, [suggestedPattern]);

    useEffect(() => {
        if (splunkEvent.hasOwnProperty(splunkFieldName)) {
            setValue(fieldIndicatorValue, splunkEvent[splunkFieldName], {shouldValidate: true});
        }
    }, [splunkFieldName]);

    return <IndicatorSection key={field.id}>
        <Heading level={3}>New IoC {`#${index}`}</Heading>
        <ComboControlGroup label="Splunk Field Name" {...generateFormInputProps(fieldSplunkFieldName)}
                           options={splunkFields}/>
        <TextControlGroup label="Indicator Value" {...generateFormInputProps(fieldIndicatorValue)} />
        <SelectControlGroup label="Indicator Category" {...generateFormInputProps(fieldIndicatorCategory)}
                            options={indicatorCategories}/>
        <StixPatternControlGroup label="STIX v2 Pattern" {...generateFormInputProps(fieldStixPattern)}
                                 useSuggestedPattern={() => setValue(fieldStixPattern, suggestedPattern, {shouldValidate: true})}
                                 suggestedPattern={suggestedPattern}/>
        <TextControlGroup label="Indicator Name" {...generateFormInputProps(fieldIndicatorName)} />
        <TextAreaControlGroup label="Description" {...generateFormInputProps(fieldIndicatorDescription)} />
    </IndicatorSection>
}
