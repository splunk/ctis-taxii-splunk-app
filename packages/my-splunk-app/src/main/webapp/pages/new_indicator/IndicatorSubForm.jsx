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

export const IndicatorSubForm = ({field, index, generateFormInputProps, splunkEvent, indicatorCategories}) => {
    const {register, setValue, watch} = useFormContext();
    const splunkFields = Object.keys(splunkEvent || {});

    const fieldSplunkFieldName = `indicators.${index}.fieldName`;
    const fieldIndicatorValue = `indicators.${index}.indicatorValue`;
    const fieldIndicatorCategory = `indicators.${index}.indicatorCategory`;
    const fieldStixPattern = `indicators.${index}.stixPattern`;

    register(fieldSplunkFieldName);
    register(fieldIndicatorValue, {required: "Indicator Value is required."});
    register(fieldIndicatorCategory, {required: "Indicator Category is required."});
    register(fieldStixPattern, {required: "STIX Pattern is required."});

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
            setValue(fieldIndicatorValue, splunkEvent[splunkFieldName]);
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
    </IndicatorSection>
}
