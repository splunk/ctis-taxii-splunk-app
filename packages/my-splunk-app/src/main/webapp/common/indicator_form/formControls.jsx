import React from 'react';
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import ConfidenceControlGroup from "@splunk/my-react-component/src/ConfidenceControlGroup";
import DatetimeControlGroup from "@splunk/my-react-component/src/DateTimeControlGroup";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import StixPatternControlGroup from "@splunk/my-react-component/src/StixPatternControlGroup";
import TextAreaControlGroup from "@splunk/my-react-component/src/TextAreaControlGroup";
import {useFormContext} from "react-hook-form";
import PropTypes from "prop-types";
import {useFormInputProps} from "../formInputProps";

export function IndicatorIdField({fieldName, ...props}) {
    return <TextControlGroup label="Indicator ID" {...useFormInputProps(fieldName)} {...props}/>
}

IndicatorIdField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function SplunkFieldNameDropdown({fieldName, options, ...props}) {
    return <SelectControlGroup label="Splunk Field" options={options}
                               {...useFormInputProps(fieldName)}
                               {...props}/>
}

SplunkFieldNameDropdown.propTypes = {
    fieldName: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
}

const confidenceFieldTooltip = `
The confidence property identifies the confidence that the creator has in the correctness of their data. The confidence value MUST be a number in the range of 0-100.
`;

export function ConfidenceField({fieldName, ...props}) {
    return <ConfidenceControlGroup label="Confidence (0-100)" max={100} min={0} step={5}
                                   tooltip={confidenceFieldTooltip}
                                   {...useFormInputProps(fieldName)}
                                   {...props}/>
}

ConfidenceField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

const tlpV1RatingOptions = [
    {label: "RED", value: "RED"},
    {label: "AMBER", value: "AMBER"},
    {label: "GREEN", value: "GREEN"},
    {label: "WHITE", value: "WHITE"}

];

export function TLPv1RatingField({fieldName, ...props}) {
    return <SelectControlGroup label="TLP v1.0 Rating"
                               options={tlpV1RatingOptions}
                               {...useFormInputProps(fieldName)}
                               {...props}
    />
}

TLPv1RatingField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function ValidFromField({fieldName, ...props}) {
    return <DatetimeControlGroup label="Valid From (UTC)" {...useFormInputProps(fieldName)} {...props}/>
}

ValidFromField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function IndicatorValueField({fieldName, ...props}) {
    return <TextControlGroup label="Indicator Value" {...useFormInputProps(fieldName)} {...props} />
}

IndicatorValueField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function IndicatorCategoryField({fieldName, options, ...props}) {
    return <SelectControlGroup label="Indicator Category"
                               options={options}
                               {...useFormInputProps(fieldName)}
                               {...props}/>
}

IndicatorCategoryField.propTypes = {
    fieldName: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
}

export function StixPatternField({suggestedPattern, fieldName, patternApiError, ...props}) {
    const formMethods = useFormContext();
    const {setValue} = formMethods;

    return <StixPatternControlGroup label="STIX Pattern"
                                    {...useFormInputProps(fieldName)}
                                    suggestedPattern={suggestedPattern}
                                    setValueToSuggestedPattern={() => setValue(fieldName, suggestedPattern, {shouldValidate: true})}
                                    patternApiError={patternApiError}
                                    {...props}
    />;
}

StixPatternField.propTypes = {
    suggestedPattern: PropTypes.string.isRequired,
    fieldName: PropTypes.string.isRequired,
    error: PropTypes.string,
    patternApiError: PropTypes.string
}

export function IndicatorNameField({fieldName, ...props}) {
    return <TextControlGroup label="Indicator Name" {...props} {...useFormInputProps(fieldName)}/>
}

IndicatorNameField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function IndicatorDescriptionField({fieldName, ...props}) {
    return <TextAreaControlGroup label="Indicator Description" {...props} {...useFormInputProps(fieldName)}/>
}

IndicatorDescriptionField.propTypes = {
    fieldName: PropTypes.string.isRequired
}
