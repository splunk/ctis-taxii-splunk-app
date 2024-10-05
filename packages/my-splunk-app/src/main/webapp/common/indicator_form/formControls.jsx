import React from 'react';
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import NumberControlGroup from "@splunk/my-react-component/src/NumberControlGroup";
import DatetimeControlGroup from "@splunk/my-react-component/src/DateTimeControlGroup";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import StixPatternControlGroup from "@splunk/my-react-component/src/StixPatternControlGroup";
import TextAreaControlGroup from "@splunk/my-react-component/src/TextAreaControlGroup";
import {useFormContext} from "react-hook-form";
import {useFormInputProps} from "../formInputProps";

export function IndicatorIdField({fieldName, ...props}) {
    return <TextControlGroup label="Indicator ID" {...useFormInputProps(fieldName)} {...props}/>
}

export function SplunkFieldNameDropdown({fieldName, options, ...props}) {
    return <SelectControlGroup label="Splunk Field" options={options}
                               {...useFormInputProps(fieldName)}
                               {...props}/>
}

export function ConfidenceField({fieldName, ...props}) {
    return <NumberControlGroup label="Confidence" max={100} min={0} step={1}
                               {...useFormInputProps(fieldName)}
                               {...props}/>
}

const TLPv1_RATING_OPTIONS = [
    {label: "RED", value: "RED"},
    {label: "AMBER", value: "AMBER"},
    {label: "GREEN", value: "GREEN"},
    {label: "WHITE", value: "WHITE"}

];

export function TLPv1RatingField({fieldName, ...props}) {
    return <SelectControlGroup label="TLP v1.0 Rating"
                               options={TLPv1_RATING_OPTIONS}
                               {...useFormInputProps(fieldName)}
                               {...props}
    />
}

export function ValidFromField({fieldName, ...props}) {
    return <DatetimeControlGroup label="Valid From (UTC)" {...useFormInputProps(fieldName)} {...props}/>
}

export function IndicatorValueField({fieldName, ...props}) {
    return <TextControlGroup label="Indicator Value" {...useFormInputProps(fieldName)} {...props} />
}

export function IndicatorCategoryField({fieldName, options, ...props}) {
    return <SelectControlGroup label="Indicator Category"
                               options={options}
                               {...useFormInputProps(fieldName)}
                               {...props}/>
}

export function StixPatternField({suggestedPattern, fieldName, ...props}) {
    const formMethods = useFormContext();
    const {setValue} = formMethods;
    return <StixPatternControlGroup label="STIX Pattern"
                                    {...useFormInputProps(fieldName)}
                                    suggestedPattern={suggestedPattern}
                                    useSuggestedPattern={() => setValue(fieldName, suggestedPattern, {shouldValidate: true})}
                                    {...props}
    />;
}

export function IndicatorNameField({fieldName, ...props}) {
    return <TextControlGroup label="Indicator Name" {...props} {...useFormInputProps(fieldName)}/>
}

export function IndicatorDescriptionField({fieldName, ...props}) {
    return <TextAreaControlGroup label="Indicator Description" {...props} {...useFormInputProps(fieldName)}/>
}

