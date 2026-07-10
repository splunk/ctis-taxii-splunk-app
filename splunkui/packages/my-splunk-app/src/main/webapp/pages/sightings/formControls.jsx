import React from 'react';
import PropTypes from 'prop-types';
import TextAreaControlGroup from '@splunk/my-page/src/TextAreaControlGroup';
import { useFormContext } from 'react-hook-form';
import { IndicatorSelectControlGroup } from '@splunk/my-page/src/controls/IndicatorSelectControlGroup';
import DatetimeControlGroup from '@splunk/my-page/src/DateTimeControlGroup';
import { useFormInputProps } from '../../common/formInputProps';

export function FirstSeen({fieldName}){
    const inputProps = useFormInputProps(fieldName);
    return (<DatetimeControlGroup label='First Seen (UTC)' setHelpTextAsRelativeTime {...inputProps}/>)
}
FirstSeen.propTypes = {
    fieldName: PropTypes.string.isRequired,
}

export function LastSeen({fieldName}){
    const inputProps = useFormInputProps(fieldName);
    return (<DatetimeControlGroup label='Last Seen (UTC)' setHelpTextAsRelativeTime {...inputProps}/>)
}
LastSeen.propTypes = {
    fieldName: PropTypes.string.isRequired,
}

export function SightingOfRef({fieldName}){
    const {setValue, watch, formState: {errors}} = useFormContext();
    const selectedIndicatorId = watch(fieldName);
    return (<IndicatorSelectControlGroup label='Sighting of Ref'
                                 error={errors[fieldName]?.message}
                                 selectedIndicatorId={selectedIndicatorId}
                                 setSelectedIndicatorId={(x) => setValue(fieldName, x, {shouldValidate: true}) } />);
}
SightingOfRef.propTypes = {
    fieldName: PropTypes.string.isRequired,
}

export function DescriptionField({fieldName, ...props}) {
    return <TextAreaControlGroup label="Description" {...useFormInputProps(fieldName)} {...props}/>
}

DescriptionField.propTypes = {
    fieldName: PropTypes.string.isRequired
}
