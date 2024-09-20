import React from 'react';
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import NumberControlGroup from "@splunk/my-react-component/src/NumberControlGroup";
import DatetimeControlGroup from "@splunk/my-react-component/src/DateTimeControlGroup";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import StixPatternControlGroup from "@splunk/my-react-component/src/StixPatternControlGroup";
import {useFormInputProps} from "../formInputProps";
import TextAreaControlGroup from "@splunk/my-react-component/src/TextAreaControlGroup";

export function GroupingIdField({fieldName, ...props}) {
    return <SelectControlGroup label="Grouping ID" {...useFormInputProps(fieldName)} {...props}/>
}

export function SplunkFieldNameDropdown({fieldName, options, ...props}) {
    return <SelectControlGroup label="Splunk Field Name" options={options}
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

export function StixPatternField({suggestedPattern, setValue, fieldName}) {
    return <StixPatternControlGroup label="STIX Pattern"
                                    {...useFormInputProps(fieldName)}
                                    suggestedPattern={suggestedPattern}
                                    useSuggestedPattern={() => setValue(fieldName, suggestedPattern, {shouldValidate: true})}
    />
}

export function IndicatorNameField({fieldName, ...props}) {
    return <TextControlGroup label="Indicator Name" {...props} {...useFormInputProps(fieldName)}/>
}

export function IndicatorDescriptionField({fieldName, ...props}) {
    return <TextAreaControlGroup label="Indicator Description" {...props} {...useFormInputProps(fieldName)}/>
}

