import React from 'react';
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import NumberControlGroup from "@splunk/my-react-component/src/NumberControlGroup";
import DatetimeControlGroup from "@splunk/my-react-component/src/DateTimeControlGroup";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import StixPatternControlGroup from "@splunk/my-react-component/src/StixPatternControlGroup";
import {useFormInputProps} from "../formInputProps";
import TextAreaControlGroup from "@splunk/my-react-component/src/TextAreaControlGroup";

export function GroupingIdField({...props}) {
    return <SelectControlGroup label="Grouping ID" {...props}/>
}

export function ConfidenceField({...props}) {
    return <NumberControlGroup label="Confidence" max={100} min={0} step={1} {...props}/>
}

export function TLPv1RatingField({...props}) {
    return <SelectControlGroup label="TLP v1.0 Rating" {...props} options={[
        {label: "RED", value: "RED"},
        {label: "AMBER", value: "AMBER"},
        {label: "GREEN", value: "GREEN"},
        {label: "WHITE", value: "WHITE"}
    ]}
    />
}

export function ValidFromField({...props}) {
    return <DatetimeControlGroup label="Valid From (UTC)" {...props}/>
}

export function IndicatorValueField({fieldName, formMethods, ...props}) {
    return <TextControlGroup label="Indicator Value" {...useFormInputProps(formMethods, fieldName)} {...props} />
}

export function IndicatorCategoryField({formMethods, fieldName, options, ...props}) {
    return <SelectControlGroup label="Indicator Category"
                               options={options}
                               {...useFormInputProps(formMethods, fieldName)}
                               {...props}/>
}

export function StixPatternField({suggestedPattern, formMethods, fieldName}) {
    const {setValue} = formMethods;
    return <StixPatternControlGroup label="STIX Pattern"
                                    {...useFormInputProps(formMethods, fieldName)}
                                    suggestedPattern={suggestedPattern}
                                    useSuggestedPattern={() => setValue(fieldName, suggestedPattern, {shouldValidate: true})}
    />
}
export function IndicatorNameField({fieldName, formMethods, ...props}) {
    return <TextControlGroup label="Indicator Name" {...props} {...useFormInputProps(formMethods, fieldName)}/>
}
export function IndicatorDescriptionField({fieldName, formMethods, ...props}) {
    return <TextAreaControlGroup label="Indicator Description" {...props} {...useFormInputProps(formMethods, fieldName)}/>
}

